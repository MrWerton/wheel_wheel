import { PrismaClient } from '@prisma/client';

export class PismaSingleton {
    private static instance: PismaSingleton;
    private db: PrismaClient;

    private constructor() {
        this.db = new PrismaClient()
    }

    public static getInstance(): PismaSingleton {
        if (!PismaSingleton.instance) {
            PismaSingleton.instance = new PismaSingleton();
        }
        return PismaSingleton.instance;
    }

    public async verifyIfUserAlreadyExists(name: string) {
        const user = await this.db.user.findUnique({
            where: {
                name: name
            }
        })

        return user;
    }

    public async getScore(name: string) {
        console.log(name)
        return await this.db.user.findUnique({
            where: {
                name: name
            },
            include: {
                score: true
            }
        })
    }
    public async setScore(name: string, win: string) {
        const user = await this.verifyIfUserAlreadyExists(name);
        if (user) {
            await this.db.score.create({
                data: {
                    win: win,
                    User: { connect: { id: user.id } }
                }
            });

        }
    }
    public async createUser(name: string) {
        await this.db.user.create({
            data: {
                name: name
            }
        });


    }
}