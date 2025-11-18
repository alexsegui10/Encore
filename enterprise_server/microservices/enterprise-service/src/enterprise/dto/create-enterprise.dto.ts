export class CreateEnterpriseDto {
  uid: string;
  email: string;
  password: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  contactEmail?: string;
  phone?: string;
  status?: 'active' | 'suspended' | 'pending';
}
