import { Column, Entity, PrimaryColumn, } from "typeorm";

@Entity("role")
export class Role {
    @PrimaryColumn({
            type:'uuid', 
            name:'role_id',
            default:()=> 'uuid_generate_v4()'
    })
    roleId:string;

    @Column({ name: 'role_name', type:'varchar', length:100, unique:true })
    roleName: string;
    
    @Column({ name: 'description', type:'text', nullable:true })
    description:string;
}