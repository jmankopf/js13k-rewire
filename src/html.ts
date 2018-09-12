
const elementById = (id: any) => document.getElementById(id);

const titleElement = elementById('title') as HTMLElement;
const gameElement = elementById('game') as HTMLElement;
const loadingElement = elementById('loading') as HTMLElement;
const menuElement = elementById('menu') as HTMLElement;
const levelDoneElement = elementById('levelDone') as HTMLElement;
const nextMsg = elementById('nextMsg') as HTMLElement;
const nextBtn = elementById('nextBtn') as HTMLElement;
const startBtn = elementById('startBtn') as HTMLElement;
const continueBtn = elementById('continueBtn') as HTMLElement;
const contentElement = elementById('content') as HTMLElement;
const resetElement = elementById('reset') as HTMLElement;
const resetBtn = elementById('resetBtn') as HTMLElement;
const levelInfo = elementById('levelInfo') as HTMLElement;
const nodeInfo = elementById('nodeInfo') as HTMLElement;
const descriptionElement = elementById('description') as HTMLElement;

const skipBtn = elementById('skipBtn') as HTMLElement;
const backBtn = elementById('backBtn') as HTMLElement;

const saveLevel = (level: number) => {
    try {
        localStorage.setItem('level', '' + level);
    } catch (e) {
        // IE and edge don't support localstorage when opening the file from disk
    }
};

const loadLevel = (): number => {
    try {
        return parseInt(localStorage.getItem('level')!) || 0;
    } catch (e) {
        return 0;
    }
};

const removeElement = (element: HTMLElement) => {
    element.parentNode!.removeChild(element);
};

const fadeTime = 0.4;

const showElement = (element: HTMLElement | HTMLElement[], onComplete?: () => void) => {
    let elements = Array.isArray(element) ? element : [element];
    elements.forEach(e => {
        e.style.visibility = 'visible';
        e.style.opacity = '0';
    });
    tween(0, 1, fadeTime,
        (t) => {
            elements.forEach(e => {
                e.style.opacity = t.toString();
            });
        },
        () => {
            onComplete && onComplete();
        }
    );
};

const hideElement = (element: HTMLElement | HTMLElement[], onComplete?: () => void) => {
    let elements = Array.isArray(element) ? element : [element];
    tween(1, 0, fadeTime,
        (t) => {
            elements.forEach(e => {
                e.style.opacity = t.toString();
            });
        },
        () => {
            elements.forEach(e => {
                e.style.visibility = 'hidden';
            });
            onComplete && onComplete();
        }
    );
};
