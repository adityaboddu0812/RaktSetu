export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export interface BloodRequest {
  _id: string;
  hospitalId: string;
  donorId: string | null;
  bloodType: string;
  contactPerson: string;
  contactNumber: string;
  urgent: boolean;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface BloodRequestPayload {
  hospitalId: string;
  bloodType: string;
  contactPerson: string;
  contactNumber: string;
  urgent: boolean;
}

export interface Donor {
  id: string;
  name: string;
  email: string;
  bloodType: string;
  age: number;
  gender: string;
  location: string;
  state: string;
  contactNumber: string;
  lastDonation?: string;
  donations: number;
  createdAt: string;
  available?: boolean;
  nextEligibleDate?: string;
}

export interface Hospital {
  id: string;
  name: string;
  email: string;
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
}

export interface DataContextType {
  bloodRequests: BloodRequest[];
  donors: Donor[];
  hospitals: Hospital[];
  addBloodRequest: (request: Omit<BloodRequest, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBloodRequestStatus: (requestId: string, urgent: boolean) => void;
  getDonorById: (id: string) => Donor | undefined;
  getHospitalById: (id: string) => Hospital | undefined;
  getRequestById: (id: string) => BloodRequest | undefined;
  getDonorsByBloodType: (bloodType: string) => Donor[];
  getRequestsByHospital: (hospitalId: string) => BloodRequest[];
  getRequestsByDonor: (donorId: string) => BloodRequest[];
  getBloodRequestsForDonor: (donorId: string) => BloodRequest[];
  getCompletedRequestsByDonorId: (donorId: string) => BloodRequest[];
  addDonor: (donor: Omit<Donor, 'id' | 'createdAt' | 'donations'>) => void;
  addHospital: (hospital: Omit<Hospital, 'id' | 'createdAt' | 'requestsMade' | 'requestsCompleted'>) => void;
  verifyHospital: (hospitalId: string, verified: boolean) => void;
  getBloodRequests: () => Promise<void>;
  createBloodRequest: (request: BloodRequestPayload) => Promise<BloodRequest>;
}
