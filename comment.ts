import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne
} from "typeorm";
import { UserEntity } from "../user";
import { Questions } from "./question";


@Entity({ name: "qb_comments" })
export class Comment {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "uuid" })
    userId!: string;

    @Column({type:"uuid", array: true})
    upvotes!: string[]; 

    @Column({ type: "timestamp" })
    createdAt!: Date;
    
    @Column({ type: "varchar" })
    body!: string;

    @ManyToOne(() => UserEntity, {eager:true})
    user!: UserEntity;

    @ManyToOne(() => Questions, (question) => question.comments)
    question!: Questions;
}
