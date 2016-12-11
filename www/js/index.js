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
        var i;

        // Check the rows and columns
        for (i=0;i<3;i++) {
            var first;
            first = state[i * 3];
            if (first !== null && state[i * 3 + 1] === first && state[i * 3 + 2] === first) {
                return first;
            }
            first = state[i];
            if (first !== null && state[3 + i] === first && state[6 + i] === first) {
                return first;
            }
        }

        // Check diagonals
        if (state[0] !== null &&
            state[4] === state[0] &&
            state[8] === state[0]) {
            return state[0];
        }
        if (state[2] !== null &&
            state[4] === state[2] &&
            state[6] === state[2]) {
            return state[2];
        }

        // Check for a tie
        for (i=0;i<9;i++) {
            if (state[i] === null) {
                return null;
            }
        }

        return 2;
    }

    // Returns all children of a given state
    function findChildren(state, player) {
        var children = [];
        for (var i=0;i<9;i++) {
            if (state[i] === null) {
                var child = state.slice();
                child[i] = player;
                children.push(child);
            }
        }
        return children;
    }

    // Performs an optimized minimax search algorithm
    function minimax(state, alpha, beta, maxing) {
        // Return in the case of a terminal state
        var gameState = findGameState(state);
        switch (gameState) {
        case 0:
            return -Number.MAX_VALUE;
        case 1:
            return Number.MAX_VALUE;
        case 2:
            return 0;
        }

        // Perform the search
        var v;
        var children;
        var i;
        if (maxing) {
            v = -Number.MAX_VALUE;
            children = findChildren(state, 1);
            for (i=0;i<children.length;i++) {
                v = Math.max(v, minimax(children[i], alpha, beta, false));
                alpha = Math.max(alpha, v);
                if (beta <= alpha) {
                    break;
                }
            }
            return v;
        } else {
            v = Number.MAX_VALUE;
            children = findChildren(state, 0);
            for (i=0;i<children.length;i++) {
                v = Math.min(v, minimax(children[i], alpha, beta, true));
                beta = Math.min(beta, v);
                if (beta <= alpha) {
                    break;
                }
            }
            return v;
        }
    }

    // Animates an animal being placed onto a cell
    function animateMove(cell, animal) {
        $(cell).append('<img class="animal ' + animal + ' spin-target" src="img/' + animal + '.png" />');
    }

    // Instructs Foxo to take his turn
    function moveFoxo(state, cells) {
        // Determine the best possible set of moves
        foxoIsMoving = true;
        var bestMoves = [];
        var maxValue = -Number.MAX_VALUE;
        for (var i=0;i<9;i++) {
            if (state[i] === null) {
                var child = state.slice();
                child[i] = 1;
                var v = minimax(child, -Number.MAX_VALUE, Number.MAX_VALUE, false);
                if (v > maxValue) {
                    bestMoves = [i];
                    maxValue = v;
                } else if (v === maxValue) {
                    bestMoves.push(i);
                }
            }
        }

        // Perform the move
        var move = bestMoves[Math.floor(Math.random() * bestMoves.length)];
        state[move] = 1;
        animateMove(cells[move], 'fox');
        foxoIsMoving = false;
    }

    // Called when the user clicks on a cell
    function userClickedCell(cells, index, state) {
        var cellState = state[index];

        // If the user can make this move
        if (findGameState(state) === null && !foxoIsMoving && cellState === null) {
            // Perform user move
            animateMove(cells[index], 'chick');
            state[index] = 0;

            // Perform foxo move
            if (findGameState(state) === null) {
                moveFoxo(state, cells);
            }
        }
    }

    var foxoIsMoving = true;

    // The home controller
    function homeController(page) {
        var state = new Array(9).fill(null);
        var cells = $(page).find('.board').children();

        // Allow Foxo to take his turn
        moveFoxo(state, cells);

        // Allow cells to be clicked
        cells.forEach(function (child, index) {
            $(child).on('click', function () {
                userClickedCell(cells, index, state);
            });
        });
    }

    app.initialize();
}());
