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

(function () {
    'use strict';

    var app = {
        initialize: function() {
            document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        },

        onDeviceReady: function() {
            this.receivedEvent('deviceready');
            document.addEventListener('resume', onResume, false);
        },

        receivedEvent: function(id) {
            if (id === 'deviceready') {
                App.controller('home', homeController);
                try {
                    App.restore();
                } catch (err) {
                    App.load('home');
                }
            }
        }
    };

    function onResume() {
        location.reload();
    }

    /*
        Return values:
            null: The game is in progress
            0   : The user has won
            1   : Foxo has won
            2   : It is a tie
     */
    function findGameState(state) {
        var lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        function winner(state, line) {
            var first = state[line[0]];
            return line.map(function (index) {
                return state[index];
            }).every(function (element) {
                return (element === first);
            });
        }

        // Check all possible win paths
        for (var i=0;i<lines.length;i++) {
            var line = lines[i];
            if (winner(state, line)) {
                return {
                    winner: state[line[0]],
                    line: line
                };
            }
        }

        // Check if game is in progress
        var progress = state.some(function (cell) {
            return (cell === null);
        });
        if (progress) {
            return {
                winner: null
            };
        }

        // It is a tie
        return {
            winner: 2
        };
    }

    // Performs an optimized minimax search algorithm
    function minimax(state, depth, alpha, beta, player) {
        // Return in the case of a terminal state
        var gameState = findGameState(state);
        var factor = (player === 1) ? 1 : -1;
        switch (gameState.winner) {
        case 0:
            return (depth - 100) * factor;
        case 1:
            return (100 - depth) * factor;
        case 2:
            return 0;
        }

        // Perform the search
        var value = null;
        var bestValue = -Number.MAX_VALUE;
        var bestMoves = null;
        for (var i=0;i<9;i++) {
            if (state[i] === null) {
                state[i] = player;
                value = -minimax(state, depth + 1, -beta, -alpha, 1 - player);
                state[i] = null;
                if (value > bestValue) {
                    bestValue = value;
                    bestMoves = [i];
                } else if (value === bestValue) {
                    bestMoves.push(i);
                }
                alpha = Math.max(alpha, value);
                if (alpha >= beta) {
                    break;
                }
            }
        }
        return (depth === 0) ? bestMoves : bestValue;
    }

    // Animates an animal being placed onto a cell
    function animateMove(cell, animal) {
        $(cell).append('<img class="animal ' + animal + ' spin-target" src="img/' + animal + '.png" />');
    }

    // Animates foxo's win
    function animateWinner(cells, gameState) {
        gameState.line.forEach(function (index) {
            var animal = $(cells[index]).find('.animal');
            animal.addClass('winner shake-slow shake-constant');
        });
    }

    // Instructs Foxo to take his turn
    function moveFoxo(state, cells, callback) {
        foxoIsMoving = true;
        var bestMoves = minimax(state, 0, -Number.MAX_VALUE, Number.MAX_VALUE, 1);
        var move = bestMoves[Math.floor(Math.random() * bestMoves.length)];
        setTimeout(function () {
            state[move] = 1;
            animateMove(cells[move], 'fox');
            foxoIsMoving = false;
            callback();
        }, 750);
    }

    // Called when the user clicks on a cell
    function userClickedCell(cells, index, state) {
        var cellState = state[index];
        var gameState = null;

        // If the user can make this move
        gameState = findGameState(state);
        if (gameState.winner === null && !foxoIsMoving && cellState === null) {
            // Perform user move
            animateMove(cells[index], 'chick');
            state[index] = 0;

            // Perform foxo move
            gameState = findGameState(state);
            if (gameState.winner === null) {
                moveFoxo(state, cells, function () {
                    gameState = findGameState(state);
                    if (gameState.winner === 1) {
                        setTimeout(function () {
                            animateWinner(cells, gameState);
                        }, 1000);
                    }
                });
            }
        }
    }

    // Set to true whilst foxo is taking his turn
    var foxoIsMoving = false;

    // The home controller
    function homeController(page) {
        var state = new Array(9).fill(null);
        var cells = $(page).find('.board').children();

        // Choose a random first move for foxo
        var bestMoves = [0, 2, 4, 6, 8];
        var move = bestMoves[Math.floor(Math.random() * bestMoves.length)];
        animateMove(cells[move], 'fox');
        state[move] = 1;

        // Allow cells to be clicked
        cells.forEach(function (child, index) {
            $(child).on('click', function () {
                userClickedCell(cells, index, state);
            });
        });
    }

    app.initialize();
}());
