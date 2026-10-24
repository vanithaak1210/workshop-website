// Data models and type definitions for RJ BODY BUILDING

export type UserRole = 'ADMIN' | 'WORKER' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  workerProfile?: WorkerProfile;
  createdAt?: string;
}

export interface WorkerProfile {
  id: string;
  userId: string;
  department: string;
  skills: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  joinDate?: string;
}

export interface WorkshopSetting {
  id: string;
  workshopName: string;
  tagline: string;
  location: string;
  experienceYears: number;
  establishedYear: number;
  phonePlaceholder: string;
  emailPlaceholder: string;
  whatsappPlaceholder: string;
  businessHours: string;
  aboutSummary: string;
}

export interface VehicleModel {
  id: string;
  categoryId: string;
  brand: string;
  modelName: string;
  supportedBodyTypes: string;
}

export interface VehicleCategory {
  id: string;
  name: string;
  description: string;
  axleType: string | null;
  tyreCount: number | null;
  models?: VehicleModel[];
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  isActive: boolean;
}

export type EnquiryStatus = 'NEW' | 'IN_REVIEW' | 'QUOTED' | 'CONVERTED' | 'REJECTED';

export interface Enquiry {
  id: string;
  enquiryNumber: string;
  customerId: string | null;
  customer?: User;
  customerName: string;
  customerPhone: string;
  vehicleCategory: string;
  vehicleMakeModel: string;
  vehiclePurpose: string;
  enquiryType: string;
  selectedService?: string | null;
  preferredDate?: string | null;
  preferredTime?: string | null;
  serviceLocation?: string | null;
  requestedServices: string; // JSON string or parsed array
  notes: string | null;
  photoUrl: string | null;
  status: EnquiryStatus;
  createdAt: string;
  quotations?: Quotation[];
}

export type QuotationStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface QuotationItem {
  id?: string;
  description: string;
  quantity: number;
  unit: string;
  unitRate: number;
  amount: number;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  enquiryId: string | null;
  enquiry?: Enquiry;
  customerId: string;
  customer?: User;
  subtotal: number;
  discount: number;
  taxOrCharges: number;
  totalAmount: number;
  notes: string | null;
  validityDate: string | null;
  estimatedCompletionDate: string | null;
  status: QuotationStatus;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  items: QuotationItem[];
  job?: Job;
  createdAt: string;
}

export type WorkshopStage =
  | 'ENQUIRY_RECEIVED'
  | 'QUOTATION_APPROVED'
  | 'BODY_BUILDING_REPAIR'
  | 'PAINTING_FINISHING'
  | 'QUALITY_CHECK'
  | 'BILLING_DELIVERY';

export interface JobStageHistory {
  id: string;
  jobId: string;
  stage: WorkshopStage;
  status: 'COMPLETED' | 'CURRENT' | 'SKIPPED' | 'PENDING';
  notes: string | null;
  skipped: boolean;
  skipReason: string | null;
  updatedById: string;
  updater?: { id: string; name: string; role: string };
  createdAt: string;
}

export interface JobTask {
  id: string;
  jobId: string;
  job?: {
    id: string;
    jobNumber: string;
    vehicleDetails: string;
    currentStage: WorkshopStage;
    expectedDeliveryDate: string | null;
    status: string;
  };
  title: string;
  description: string | null;
  department: string;
  assignedWorkerId: string | null;
  assignedWorker?: { id: string; name: string };
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  notes: string | null;
  completedAt: string | null;
  createdAt?: string;
}

export interface Job {
  id: string;
  jobNumber: string;
  quotationId: string;
  quotation?: Quotation;
  enquiryId: string | null;
  enquiry?: Enquiry;
  customerId: string;
  customer?: User;
  vehicleDetails: string;
  currentStage: WorkshopStage;
  expectedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  status: 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'DELIVERED';
  createdAt: string;
  stageHistory?: JobStageHistory[];
  tasks?: JobTask[];
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  subject: string | null;
  message: string;
  status: 'NEW' | 'READ' | 'RESPONDED';
  createdAt: string;
}

export interface DashboardMetrics {
  customerCount: number;
  totalEnquiries: number;
  totalBookings?: number;
  pendingBookings?: number;
  confirmedBookings?: number;
  inProgressBookings?: number;
  completedBookings?: number;
  cancelledBookings?: number;
  pendingEnquiries: number;
  pendingOrders: number;
  confirmedOrders: number;
  completedOrders: number;
  totalQuotations?: number;
  pendingQuotations: number;
  approvedQuotations: number;
  totalWorkers?: number;
  workers?: { id: string; name: string; workType: string }[];
  ongoingJobs: number;
  readyForDeliveryJobs: number;
  deliveredJobs: number;
  orderStatusDistribution?: Record<string, number>;
  serviceCategoryTrends?: Record<string, number>;
}

