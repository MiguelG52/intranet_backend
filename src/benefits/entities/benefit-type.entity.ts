import { Column, Entity, PrimaryColumn } from "typeorm"

@Entity("benefit_type")
export class BenefitType{
    @PrimaryColumn({type:"uuid", default: () => "uuid_generate_v4()", name:"benefit_type_id" })
    benefitTypeId:string
    
    @Column({type:"varchar", nullable:false})
    title:string

    @Column({type:"varchar", nullable:true})
    description:string

    @Column({type:"varchar", nullable:true, name:"icon"})
    icon:string
}