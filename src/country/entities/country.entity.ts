import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({name:"country"})
export class Country {

    @PrimaryColumn({name:"code", type:"varchar", length:10})
    code:string;

    @Column({name:"name", length:100, type:"varchar"})
    name:string
}
