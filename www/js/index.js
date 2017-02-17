/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Ad variables
let admobid = null;
let admobBanner = false;
// Set to true whilst foxo is taking his turn
let foxoIsMoving = false;
// Set to true whilst the user is taking their turn
let userIsMoving = false;
// Set to true if foxo is to go first
let foxoGoesFirst = true;
// The state
const state = new Array(9).fill(null);

// Ad unit configuration
if (/(android)/i.test(navigator.userAgent)) {
    // Android
    admobid = {
        banner: 'ca-app-pub-4400088783500800/8156202576',
        interstitial: 'ca-app-pub-4400088783500800/2109668973',
    };
} else if (/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
    // iOS
    admobid = {
        banner: 'ca-app-pub-4400088783500800/8156202576',
        interstitial: 'ca-app-pub-4400088783500800/2109668973',
    };
} else {
    // Windows
    admobid = {
        banner: 'ca-app-pub-4400088783500800/8156202576',
        interstitial: 'ca-app-pub-4400088783500800/2109668973',
    };
}

function renderInterstitial(testing) {
    const product = store.get('foxo_remove_ads');
    if (!product.owned) {
        AdMob.prepareInterstitial({
            adId: admobid.interstitial,
            isTesting: testing,
            autoShow: true,
        });
    }
}

function renderBanner(testing) {
    const product = store.get('foxo_remove_ads');
    if (product.owned && admobBanner) {
        AdMob.removeBanner();
        admobBanner = false;
    } else if (!product.owned && !admobBanner) {
        AdMob.createBanner({
            adId: admobid.banner,
            position: AdMob.AD_POSITION.BOTTOM_CENTER,
            isTesting: testing,
            overlap: false,
            offsetTopBar: false,
            bgColor: 'black',
        });
        admobBanner = true;
    }
}

function winner(line) {
    const first = state[line[0]];
    return (first !== null) &&
        line.map(index => state[index]).every(element => (element === first));
}

/*
    Return values:
        null: The game is in progress
        0   : The user has won
        1   : Foxo has won
        2   : It is a tie
*/
function findGameState() {
    const lines = [
         [0, 1, 2], [3, 4, 5], [6, 7, 8],
         [0, 3, 6], [1, 4, 7], [2, 5, 8],
         [0, 4, 8], [2, 4, 6],
    ];

    // Check all possible win paths
    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        if (winner(line)) {
            return {
                winner: state[line[0]],
                line,
            };
        }
    }

    // Check if game is in progress
    const progress = state.some(cell => (cell === null));
    if (progress) {
        return {
            winner: null,
        };
    }

    // It is a tie
    return {
        winner: 2,
    };
}

// Performs an optimized minimax search algorithm
function minimax(depth, player) {
    // Return in the case of a terminal state
    const gameState = findGameState();
    const factor = (player === 1) ? 1 : -1;
    switch (gameState.winner) {
    case 0:
        return (depth - 100) * factor;
    case 1:
        return (100 - depth) * factor;
    case 2:
        return 0;
    default:
    }

    // Perform the search
    let value = null;
    let bestValue = -Number.MAX_VALUE;
    let bestMoves = null;
    for (let i = 0; i < 9; i += 1) {
        if (state[i] === null) {
            state[i] = player;
            value = -minimax(depth + 1, 1 - player);
            state[i] = null;
            if (value > bestValue) {
                bestValue = value;
                bestMoves = [i];
            } else if (value === bestValue) {
                bestMoves.push(i);
            }
        }
    }
    if (depth === 0) {
        return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }
    return bestValue;
}

// Animates an animal being placed onto a cell
function animateMove(cell, animal) {
    $(cell).append(`<img class="animal ${animal} spin-target" src="img/${animal}.png" />`);
}

// Change the foxo quote
function changeFoxoText(page) {
    const quotes = [
        'Foxo wins again!',
        'Too crafty for you.',
        'Foxtastic!',
        'What does the foxo say?',
        'Better luck next time.',
        'Foxo remains undefeated.',
        'Foxo always wins!',
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    const text = $(page).find('.foxo-text');
    text.remove();
    text.text(quote);
    $(page).find('.top-section').append(text);
}

// Animates foxo's win
function animateWinner(page, cells, gameState) {
    gameState.line.forEach((index) => {
        const animal = $(cells[index]).find('.animal');
        animal.addClass('winner shake-slow shake-constant');
    });
}

// Instructs Foxo to take his turn
function moveFoxo(cells) {
    foxoIsMoving = true;
    const move = minimax(0, 1);
    state[move] = 1;
    setTimeout(() => {
        animateMove(cells[move], 'fox');
    }, 750);
    foxoIsMoving = false;
}

// Updates the score
function updateScore(page, gameState) {
    const tie = $(page).find('#tie-text');
    const win = $(page).find('#win-text');
    const storage = window.localStorage;
    const key = 'foxo:score';
    const score = JSON.parse(storage.getItem(key)) || {
        tie: 0,
        win: 0,
    };

    if (gameState) {
        switch (gameState.winner) {
        case 1:
            score.win += 1;
            break;
        case 2:
            score.tie += 1;
            break;
        default:
        }
    }

    storage.setItem(key, JSON.stringify(score));
    tie.text(score.tie);
    win.text(score.win);
}

// Called when the user clicks on a cell
function userClickedCell(page, cells, index) {
    const cellState = state[index];
    let gameState = null;
    const foxLogo = $(page).find('.fox-logo');
    const playButton = $(page).find('.play-button');

    // If the user can make this move
    gameState = findGameState();
    if (gameState.winner === null && !foxoIsMoving && !userIsMoving && cellState === null) {
        // Perform user move
        userIsMoving = true;
        animateMove(cells[index], 'chick');
        state[index] = 0;

        // Perform foxo move
        gameState = findGameState();
        if (gameState.winner === null) {
            moveFoxo(cells);
            gameState = findGameState();
            if (gameState.winner !== null) {
                updateScore(page, gameState);
                foxLogo.hide();
                playButton.show();
                if (gameState.winner === 1) {
                    setTimeout(() => {
                        changeFoxoText(page);
                    }, 500);
                    setTimeout(() => {
                        animateWinner(page, cells, gameState);
                    }, 1000);
                }
            }
        } else {
            updateScore(page, gameState);
            foxLogo.hide();
            playButton.show();
        }
        userIsMoving = false;
    }
}

// Choose a random first move for foxo
function foxoFirstMove(cells) {
    const bestMoves = [0, 2, 4, 6, 8];
    const move = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    animateMove(cells[move], 'fox');
    state[move] = 1;
}

// The home controller
function homeController(page) {
    const cells = $(page).find('.board').children();
    const foxLogo = $(page).find('.fox-logo');
    const playButton = $(page).find('.play-button');

    // Load the score
    updateScore(page, null);

    // Move foxo
    foxoFirstMove(cells);

    // Allow cells to be clicked
    cells.forEach((child, index) => {
        $(child).on('click', () => {
            userClickedCell(page, cells, index);
        });
    });

    // Allow the play button to be clicked
    playButton.on('click', () => {
        foxLogo.show();
        playButton.hide();
        const gameState = findGameState();
        if (gameState.winner !== null && !foxoIsMoving) {
            for (let i = 0; i < 9; i += 1) {
                state[i] = null;
                $(cells[i]).empty();
            }
        }
        foxoGoesFirst = !foxoGoesFirst;
        if (foxoGoesFirst) {
            foxoFirstMove(cells);
        }
    });

    // Allow the information button to be clicked
    $(page).find('#info-button').on('click', () => App.load('info'));
}

function infoController(page) {
    const productButton = $(page).find('#product-button');
    const restoreButton = $(page).find('#restore-button');
    $(page).find('#donate-button').on('click', () => window.open('https://ko-fi.com/A214L4K'));
    productButton.on('click', () => store.order('foxo_remove_ads'));
    restoreButton.on('click', () => store.refresh());

    // Conditionally display the remove ads button
    function renderPurchase() {
        const product = store.get('foxo_remove_ads');
        if (product && product.state === store.VALID && !product.owned && product.canPurchase) {
            productButton.removeClass('hidden');
            restoreButton.removeClass('hidden');
        } else {
            productButton.addClass('hidden');
            restoreButton.addClass('hidden');
        }
    }

    $(page).on('appShow', () => {
        renderPurchase();
        store.when('foxo_remove_ads').updated(renderPurchase);
    });

    $(page).on('appHide', () => {
        store.off(renderPurchase);
    });
}

(function initialize() {
    // When the device is ready
    document.addEventListener('deviceready', () => {
        // Register app product
        cordova.plugins.DeviceMeta.getDeviceMeta((result) => {
            store.ready(() => {
                renderInterstitial(result.debug);
            });
            store.register({
                id: 'foxo_remove_ads',
                alias: 'Remove Ads',
                type: store.NON_CONSUMABLE,
            });
            store.when('foxo_remove_ads').approved(product => product.finish());
            store.when('foxo_remove_ads').updated(() => renderBanner(result.debug));
            store.refresh();
        });

        // Setup controllers
        App.controller('home', homeController);
        App.controller('info', infoController);

        // Load app
        try {
            App.restore();
        } catch (err) {
            App.load('home');
        }
    }, false);

    // When the app resumes
    document.addEventListener('resume', () => location.reload(), false);
}());
