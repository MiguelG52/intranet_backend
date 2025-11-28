import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { BenefitType } from "./benefit-type.entity";
import { Country } from "src/country/entities/country.entity";

@Entity("benefit")
export class Benefit {
    @PrimaryColumn({type:"uuid", default: () => "uuid_generate_v4()", name:"benefit_id" })
    benefitId:string
    
    @Column({type:"varchar", nullable:false})
    countryCode:string

    @Column({type:"varchar", nullable:false})
    title:string

    @Column({type:"varchar", nullable:true})
    description:string

    @Column({type:"uuid", nullable:false})
    benefitTypeId:string


    //Relations 
    @ManyToOne(()=> BenefitType)
    @JoinColumn({name:"benefit_type_id", referencedColumnName:"benefitTypeId"})
    benefitType: BenefitType

    @ManyToOne(()=> Country)
    @JoinColumn({name:"country_code", referencedColumnName:"code"})
    country: Country
}
