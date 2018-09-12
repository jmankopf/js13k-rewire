type System = {
    addEntity: (entity: Entity) => void;
    update?: (time: number) => void;
    shutdown?: () => void;
};
type RenderSystem = System & { render: (context: Context, time: number) => void }
type UpdateSystem = System & { update: (time: number) => void }

interface Space {
    entities: Partial<Entity>[];

    registerSystem(system: System): void;

    addEntity(entity: Partial<Entity>): void;

    shutdown(): void;
}

const createSpace = (): Space => {
    const systems: System[] = [];
    const entities: Partial<Entity>[] = [];

    return {
        registerSystem: (system: System) => {
            systems.push(system);
        },
        addEntity: (entity: Partial<Entity>) => {
            entities.push(entity);
            systems.forEach(system => {
                system.addEntity(entity as Entity);
            });
        },
        shutdown:()=> {
            systems.forEach(system => system.shutdown && system.shutdown());
        },
        entities
    };
};
