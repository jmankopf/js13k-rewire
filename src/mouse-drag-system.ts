const createMouseDragSystem = (inputControl:InputControl): UpdateSystem => {

    const sp: Vec2 = {x: 0, y: 0};
    const spools: Entity[] = [];
    let dragEntity: MouseDragEntity;
    let finishEntity: FinishEntity;
    let isDragging = false;
    let isOver = false;
    return {
        addEntity: entity => {
            // we need the spools to check if we collide
            if (entity.spool && (entity.spool.type === NodeType.spool || entity.spool.type === NodeType.isolator)) {
                spools.push(entity);
            }
            if (entity.finish) {
                finishEntity = entity;
            }

            if (entity.mouseDrag) {
                inputControl.dragControl(entity, {
                    mouseOver: () => {
                        isOver = true;
                        if (inputControl.isMouseDown()) {
                            return;
                        }
                        document.body.style.cursor = 'pointer';
                        dragEntity = entity;
                        entity.render.hover = true;

                    },
                    mouseOut: () => {
                        document.body.style.cursor = 'default';
                        isOver = false;
                        if (!isDragging) {
                            entity.render.hover = false;
                        }

                    },
                    mouseDown: () => {
                        isDragging = true;
                        copyIntoV(sp, subV(inputControl.mousePos, entity.pos));
                    },
                    mouseUp:()=> {
                        isDragging = false;
                        if (!isOver) {
                            entity.render.hover = false;
                        }

                    },
                    mouseDownUpdate: () => {
                    }

                });
            }
        },
        update: (time: number) => {
            inputControl.update();
            if (!dragEntity) {
                return;
            }

            isDragging && copyIntoV(dragEntity.pos, subV(inputControl.mousePos, sp));

            const v1 = dragEntity.pos;

            // push away from border
            v1.x = clamp(v1.x, 0, 1280);
            v1.y = clamp(v1.y, 0, 720);

            // push end node away from spools
            spools.forEach(spool => {
                if (spool === dragEntity) {
                    return;
                }
                const v2 = spool.pos;
                const dist = 10 + spool.spool.size;
                if (distV(v1, v2) < dist) {
                    const dir = normalizeV(subV(v1, v2));
                    if (dir.x == 0 && dir.y == 0) {
                        dir.x = 1;
                    }
                    const v = mulVS(dir, dist);
                    dragEntity.pos = addV(v2, v);

                }
            });

            // snap to finish
            if (distV(v1, finishEntity.pos) < 30) {
                finishEntity.finish.connected = true;
                copyIntoV(dragEntity.pos, finishEntity.pos);
            } else {
                finishEntity.finish.connected = false;
            }

        }
    };
};
