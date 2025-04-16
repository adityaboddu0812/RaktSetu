export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export interface BloodRequest {
  _id: string;
  hospitalId: string;
  hospitalName: string;
  bloodType: string;
  contactPerson: string;
  contactNumber: string;
  urgent: boolean;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface BloodRequestPayload {
  bloodType: string;
  contactPerson: string;
  contactNumber: string;
  urgent: boolean;
}

export interface Donor {
  _id: string;
  name: string;
  email: string;
  bloodGroup: string;
  age?: number;
  gender?: string;
  city: string;
  state: string;
  phone: string;
  lastDonation?: string;
  donations?: number;
  createdAt: string;
}

export interface Hospital {
  _id: string;
  name: string;
  email: string;
  licenseNumber: string;
  phone: string;
  city: string;
  state: string;
  location?: string;
  contactPerson: string;
  contactNumber?: string;
  isVerified: boolean;
  requestsMade: number;
  requestsCompleted: number;
  createdAt: string;
  updatedAt: string;
}

export interface DataContextType {
  bloodRequests: BloodRequest[];
  donors: Donor[];
  hospitals: Hospital[];
  addBloodRequest: (request: Omit<BloodRequest, '_id' | 'createdAt' | 'updatedAt'>) => void;
  updateBloodRequestStatus: (requestId: string, urgent: boolean) => void;
  getDonorById: (id: string) => Donor | undefined;
  getHospitalById: (id: string) => Hospital | undefined;
  getRequestById: (id: string) => BloodRequest | undefined;
  getDonorsByBloodType: (bloodType: string) => Donor[];
  getRequestsByHospital: (hospitalId: string) => BloodRequest[];
  getRequestsByDonor: (donorId: string) => BloodRequest[];
  getBloodRequestsForDonor: (donorId: string) => BloodRequest[];
  getCompletedRequestsByDonorId: (donorId: string) => BloodRequest[];
  addDonor: (donor: Omit<Donor, '_id' | 'createdAt' | 'donations'>) => void;
  addHospital: (hospital: Omit<Hospital, '_id' | 'createdAt' | 'requestsMade' | 'requestsCompleted'>) => void;
  verifyHospital: (hospitalId: string, verified: boolean) => void;
  getBloodRequests: () => Promise<void>;
  createBloodRequest: (request: BloodRequestPayload) => Promise<BloodRequest>;
}
