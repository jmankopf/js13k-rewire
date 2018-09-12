/// <reference path="types.ts" />
/// <reference path="utils" />
/// <reference path="math-util.ts" />
/// <reference path="html.ts" />
/// <reference path="resources.ts" />
/// <reference path="game.ts" />

const showEndScreen = () => {
    nextMsg.innerHTML = 'Thanks for playing!';
    nextBtn.innerHTML = 'AGAIN';
    showElement(levelDoneElement, () => {
        nextBtn.addEventListener('click', e => {
            location.reload();
        });
    });
    saveLevel(0);
};

const startGame = (parent: HTMLElement, resources: Resources, startLevel: number) => {
    const game = createGame();
    let currentLevel = startLevel;

    const startNextLevel = () => {
        console.log('start level ' + currentLevel);

        let tutorial: HTMLElement;
        if (currentLevel == 0) {
            tutorial = resources.tutorial1;
            gameElement.appendChild(tutorial);
            showElement(tutorial);
        }
        if (currentLevel == 2) {
            tutorial = resources.tutorial2;
            gameElement.appendChild(tutorial);
            showElement(tutorial);
        }

        const level = game.createLevel(gameData.levels[currentLevel], resources, () => {
            if (tutorial) {
                hideElement(tutorial, () => {
                    removeElement(tutorial);
                });
            }
            if (currentLevel < gameData.levels.length - 1) {
                currentLevel++;
                saveLevel(currentLevel);
                hideElement(resetElement);
                showElement([levelDoneElement], () => {
                    nextBtn.onclick = () => {
                        nextBtn.onclick = null;
                        hideElement([levelDoneElement, level.canvas, levelInfo, nodeInfo], () => {
                            removeElement(level.canvas);
                            startNextLevel();
                        });

                    };
                });
            } else {
                showEndScreen();
            }
        });

        parent.appendChild(level.canvas);
        levelInfo.innerHTML = 'Level ' + (currentLevel + 1);
        showElement([level.canvas, resetElement, levelInfo, nodeInfo]);

        const resetLevel = () => {
            if (tutorial) {
                hideElement(tutorial, () => {
                    removeElement(tutorial);
                });
            }
            backBtn.onclick = skipBtn.onclick = resetBtn.onclick = null;
            hideElement([level.canvas, resetElement, levelInfo, nodeInfo], () => {
                level.shutdown();
                removeElement(level.canvas);
                startNextLevel();
            });

        };

        resetBtn.onclick = resetLevel;
        skipBtn.onclick = () => {
            if (currentLevel > gameData.levels.length - 2) {
                return;
            }
            currentLevel++;
            resetLevel();
        };
        backBtn.onclick = () => {
            if (currentLevel < 1) {
                return;
            }
            currentLevel--;
            resetLevel();
        };
    };

    startNextLevel();
};

const prepareGame = () => {
    const [loadingBar, context] = createCanvas(200, 7);
    loadingBar.id = 'loadingbar';
    loadingElement.appendChild(loadingBar);
    showElement(loadingBar);
    context.strokeStyle = 'grey';
    context.fillStyle = 'grey';
    context.lineWidth = 1;

    context.strokeRect(0.5, 0.5, 199, 4);
    generateResources(p => {
        context.fillRect(0.5, 0.5, 199 / 100 * p, 4);
    }, (resources) => {

        hideElement(loadingBar, () => {
            showElement([menuElement, descriptionElement]);

            const savedLevel = loadLevel();
            continueBtn.style.visibility = savedLevel ? 'visible' : 'hidden';

            const hideUIandStartGame = (startLevel: number) => {
                startBtn.onclick = continueBtn.onclick = null;
                hideElement([titleElement, menuElement, descriptionElement], () => {
                    startGame(contentElement, resources, startLevel);
                });
            };
            startBtn.onclick = () => {
                saveLevel(0);
                hideUIandStartGame(0);
            };

            continueBtn.onclick = () => {
                hideUIandStartGame(savedLevel);
            };

            // hideUIandStartGame(10); // skip main menu and start with level
        });

    });
};

showElement(titleElement, prepareGame);
