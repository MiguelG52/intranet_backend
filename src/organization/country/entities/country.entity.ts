import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { PublicHoliday } from "src/vacations/entities/public-holiday.entity";

@Entity({name:"country"})
export class Country {

    @PrimaryColumn({name:"code", type:"varchar", length:10})
    code:string;

    @Column({name:"name", length:100, type:"varchar"})
    name:string

    @Column({ name: 'phone_country_code', type: 'varchar', length: 5, nullable: true })
    phoneCountryCode: string;

    @OneToMany(() => PublicHoliday, (holiday) => holiday.country)
    holidays: PublicHoliday[];
}
