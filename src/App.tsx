import React, { useState, useEffect } from 'react';
// @ts-ignore
import muhammadLogo from './assets/images/muhammad_pay_later_logo_1784103225588.jpg';
import { 
  DollarSign, 
  ShieldCheck, 
  User, 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus, 
  LogOut, 
  Menu,
  X,
  ArrowRight, 
  TrendingUp, 
  AlertTriangle, 
  Landmark, 
  Settings, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  HelpCircle, 
  Sparkles,
  Info,
  Layers,
  Smartphone,
  CheckCircle2,
  Lock,
  PlusCircle,
  TrendingDown,
  RefreshCw,
  Bell,
  Calendar,
  History,
  Search
} from 'lucide-react';

// --- Types & Interfaces ---
interface UserProfile {
  id: string;
  name: string;
  username?: string;
  role: 'admin' | 'member';
  pin: string;
  creditLimit: number; // For members
  spentAmount: number; // For members
}

interface PurchaseRequest {
  id: string;
  userId: string;
  userName: string;
  productName: string;
  totalPrice: number;
  installments: number; // 1 (Full payment), 3, 6, 12 months
  monthlyAmount: number;
  interestRate: number; // Optional monthly interest rate (e.g., 0% or 1.5%)
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  approvedDate?: string;
  requestType?: 'pay_later' | 'cash_loan';
}

interface BillInstallment {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  productName: string;
  monthIndex: number; // 1 to installments
  dueDate: string;
  amount: number;
  status: 'unpaid' | 'notified' | 'paid';
  notificationDate?: string;
  notificationNotes?: string;
  slipImage?: string;
  reminded?: boolean;
  requestType?: 'pay_later' | 'cash_loan';
}

// --- Helpers for Thai Dates & Grouping ---
const getYearMonthKey = (dateStr: string): string => {
  const parts = dateStr.split('-');
  if (parts.length < 2) return dateStr;
  return `${parts[0]}-${parts[1]}`; // "YYYY-MM"
};

const getThaiMonthYearFromKey = (yearMonthKey: string): string => {
  const parts = yearMonthKey.split('-');
  if (parts.length < 2) return yearMonthKey;
  const yearAd = parseInt(parts[0]);
  const monthIndex = parseInt(parts[1]) - 1;
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const yearTh = yearAd + 543;
  return `${thaiMonths[monthIndex]} ${yearTh}`;
};

const getThaiShortDate = (dateStr: string): string => {
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const yearTh = parseInt(parts[0]) + 543;
  const day = parseInt(parts[2]);
  const thaiShortMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const monthIndex = parseInt(parts[1]) - 1;
  return `${day} ${thaiShortMonths[monthIndex]} ${yearTh}`;
};

// --- Helper to Generate dynamic bank slip in SVG Format (Fully reliable, client-side, zero network dependencies) ---
const generateDemoSlip = (bank: 'kbank' | 'scb', amount: number, name: string) => {
  const dateStr = '13/7/2569, 18:32';
  const bgColor = bank === 'kbank' ? '#00A859' : '#4E2E80';
  const bankName = bank === 'kbank' ? 'KASIKORNBANK' : 'SCB Bank';
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
      <rect width="400" height="600" fill="#f8fafc" />
      
      <!-- Header Banner -->
      <path d="M 0 0 L 400 0 L 400 130 L 0 160 Z" fill="${bgColor}" />
      <circle cx="200" cy="-20" r="150" fill="white" opacity="0.1" />
      
      <!-- Bank logo and title -->
      <text x="30" y="50" fill="white" font-family="sans-serif" font-weight="bold" font-size="24">e-Slip</text>
      <text x="30" y="80" fill="white" font-family="sans-serif" font-size="14" opacity="0.9">โอนเงินสำเร็จ</text>
      <text x="370" y="50" fill="white" font-family="sans-serif" font-weight="bold" font-size="18" text-anchor="end">${bankName}</text>
      
      <!-- Slip Body Details -->
      <g transform="translate(30, 200)">
        <!-- Date -->
        <text x="0" y="0" fill="#64748b" font-family="sans-serif" font-size="12">วัน-เวลาที่ทำรายการ</text>
        <text x="0" y="22" fill="#1e293b" font-family="sans-serif" font-weight="bold" font-size="14">${dateStr} น.</text>
        
        <!-- Divider -->
        <line x1="0" y1="45" x2="340" y2="45" stroke="#e2e8f0" stroke-dasharray="4" />
        
        <!-- Sender -->
        <text x="0" y="70" fill="#64748b" font-family="sans-serif" font-size="12">จาก</text>
        <text x="0" y="92" fill="#1e293b" font-family="sans-serif" font-weight="bold" font-size="14">${name}</text>
        <text x="0" y="110" fill="#64748b" font-family="sans-serif" font-size="12">บัญชีออมทรัพย์ xxx-x-x1234-x</text>
        
        <!-- Arrow -->
        <path d="M 15 130 L 15 150 M 10 145 L 15 150 L 20 145" stroke="#cbd5e1" stroke-width="2" fill="none" />
        
        <!-- Recipient -->
        <text x="0" y="180" fill="#64748b" font-family="sans-serif" font-size="12">ไปยัง</text>
        <text x="0" y="202" fill="#1e293b" font-family="sans-serif" font-weight="bold" font-size="14">เบียร์ (Admin)</text>
        <text x="0" y="220" fill="#64748b" font-family="sans-serif" font-size="12">พร้อมเพย์ 081-234-5678</text>
        
        <!-- Divider -->
        <line x1="0" y1="245" x2="340" y2="245" stroke="#e2e8f0" stroke-dasharray="4" />
        
        <!-- Amount -->
        <text x="0" y="275" fill="#64748b" font-family="sans-serif" font-size="12">จำนวนเงิน</text>
        <text x="340" y="275" fill="#1e293b" font-family="sans-serif" font-weight="extrabold" font-size="20" text-anchor="end">฿ ${amount.toLocaleString()}</text>
        
        <text x="0" y="305" fill="#64748b" font-family="sans-serif" font-size="12">ค่าธรรมเนียม</text>
        <text x="340" y="305" fill="#1e293b" font-family="sans-serif" font-weight="bold" font-size="14" text-anchor="end">0.00 บาท</text>
      </g>
      
      <!-- Footer reference QR / Watermark -->
      <g transform="translate(200, 560)" text-anchor="middle">
        <text fill="#94a3b8" font-family="sans-serif" font-size="10">รหัสอ้างอิง: Ref_DEMO710MX</text>
        <text fill="#cbd5e1" font-family="sans-serif" font-size="9" y="15">ข้อมูลสลิปนี้ถูกตรวจสอบโดยระบบ Family PayLater แล้ว</text>
      </g>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// --- Initial Seed Mock Data ---
const INITIAL_PROFILES: UserProfile[] = [
  { id: 'u-1', name: 'เบียร์ (Admin)', username: 'beer', role: 'admin', pin: '9999', creditLimit: 0, spentAmount: 0 },
  { id: 'u-5', name: 'มิน (Admin)', username: 'min', role: 'admin', pin: '7777', creditLimit: 0, spentAmount: 0 },
  { id: 'u-2', name: 'น้องบี (Bee)', username: 'bee', role: 'member', pin: '1111', creditLimit: 10000, spentAmount: 0 },
  { id: 'u-3', name: 'พี่เอ (A)', username: 'a', role: 'member', pin: '2222', creditLimit: 20000, spentAmount: 7300 },
  { id: 'u-4', name: 'แม่ (Mom)', username: 'mom', role: 'member', pin: '3333', creditLimit: 20000, spentAmount: 0 }
];

const INITIAL_REQUESTS: PurchaseRequest[] = [
  {
    id: 'req-1',
    userId: 'u-2',
    userName: 'น้องบี (Bee)',
    productName: 'เคส iPhone 15 Pro',
    totalPrice: 1290,
    installments: 3,
    monthlyAmount: 430,
    interestRate: 0,
    status: 'pending',
    requestDate: '2026-07-14'
  },
  {
    id: 'req-2',
    userId: 'u-3',
    userName: 'พี่เอ (A)',
    productName: 'รองเท้าวิ่ง Nike Air',
    totalPrice: 4500,
    installments: 6,
    monthlyAmount: 750,
    interestRate: 0,
    status: 'approved',
    requestDate: '2026-07-10',
    approvedDate: '2026-07-10'
  },
  {
    id: 'req-3',
    userId: 'u-4',
    userName: 'แม่ (Mom)',
    productName: 'ชุดเครื่องครัว Tefal',
    totalPrice: 2000,
    installments: 1,
    monthlyAmount: 2000,
    interestRate: 0,
    status: 'approved',
    requestDate: '2026-07-09',
    approvedDate: '2026-07-09'
  },
  {
    id: 'req-4',
    userId: 'u-3',
    userName: 'พี่เอ (A)',
    productName: 'คีย์บอร์ด Logi MX',
    totalPrice: 3550,
    installments: 5,
    monthlyAmount: 710,
    interestRate: 0,
    status: 'approved',
    requestDate: '2026-07-08',
    approvedDate: '2026-07-08'
  }
];

const INITIAL_INSTALLMENTS: BillInstallment[] = [
  // Nike Air (6 months) - Month 1 paid, remaining unpaid
  { id: 'inst-2-1', requestId: 'req-2', userId: 'u-3', userName: 'พี่เอ (A)', productName: 'รองเท้าวิ่ง Nike Air', monthIndex: 1, dueDate: '2026-08-01', amount: 750, status: 'paid' },
  { id: 'inst-2-2', requestId: 'req-2', userId: 'u-3', userName: 'พี่เอ (A)', productName: 'รองเท้าวิ่ง Nike Air', monthIndex: 2, dueDate: '2026-09-01', amount: 750, status: 'unpaid' },
  { id: 'inst-2-3', requestId: 'req-2', userId: 'u-3', userName: 'พี่เอ (A)', productName: 'รองเท้าวิ่ง Nike Air', monthIndex: 3, dueDate: '2026-10-01', amount: 750, status: 'unpaid' },
  { id: 'inst-2-4', requestId: 'req-2', userId: 'u-3', userName: 'พี่เอ (A)', productName: 'รองเท้าวิ่ง Nike Air', monthIndex: 4, dueDate: '2026-11-01', amount: 750, status: 'unpaid' },
  { id: 'inst-2-5', requestId: 'req-2', userId: 'u-3', userName: 'พี่เอ (A)', productName: 'รองเท้าวิ่ง Nike Air', monthIndex: 5, dueDate: '2026-12-01', amount: 750, status: 'unpaid' },
  { id: 'inst-2-6', requestId: 'req-2', userId: 'u-3', userName: 'พี่เอ (A)', productName: 'รองเท้าวิ่ง Nike Air', monthIndex: 6, dueDate: '2027-01-01', amount: 750, status: 'unpaid' },

  // Tefal Cookware (1 month) - Fully paid
  { id: 'inst-3-1', requestId: 'req-3', userId: 'u-4', userName: 'แม่ (Mom)', productName: 'ชุดเครื่องครัว Tefal', monthIndex: 1, dueDate: '2026-08-01', amount: 2000, status: 'paid' },

  // Logi MX Keyboard (5 months) - Unpaid
  { id: 'inst-4-1', requestId: 'req-4', userId: 'u-3', userName: 'พี่เอ (A)', productName: 'คีย์บอร์ด Logi MX', monthIndex: 1, dueDate: '2026-08-01', amount: 710, status: 'notified', notificationDate: '2026-07-13', notificationNotes: 'แนบสลิป: kbank_slip_710_baht.svg', slipImage: generateDemoSlip('kbank', 710, 'พี่เอ (A)') },
  { id: 'inst-4-2', requestId: 'req-4', userId: 'u-3', userName: 'พี่เอ (A)', productName: 'คีย์บอร์ด Logi MX', monthIndex: 2, dueDate: '2026-09-01', amount: 710, status: 'unpaid' },
  { id: 'inst-4-3', requestId: 'req-4', userId: 'u-3', userName: 'พี่เอ (A)', productName: 'คีย์บอร์ด Logi MX', monthIndex: 3, dueDate: '2026-10-01', amount: 710, status: 'unpaid' },
  { id: 'inst-4-4', requestId: 'req-4', userId: 'u-3', userName: 'พี่เอ (A)', productName: 'คีย์บอร์ด Logi MX', monthIndex: 4, dueDate: '2026-11-01', amount: 710, status: 'unpaid' },
  { id: 'inst-4-5', requestId: 'req-4', userId: 'u-3', userName: 'พี่เอ (A)', productName: 'คีย์บอร์ด Logi MX', monthIndex: 5, dueDate: '2026-12-01', amount: 710, status: 'unpaid' },
];

export default function App() {
  // --- Persistent States ---
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('fp_profiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserProfile[];
        const needsUpdate = parsed.some(p => p.id === 'u-1' && (p.name.includes('คุณพ่อ') || p.pin === '1234')) || !parsed.some(p => p.id === 'u-5');
        if (needsUpdate) {
          let migrated = parsed.map(p => {
            if (p.id === 'u-1') {
              return { ...p, name: 'เบียร์ (Admin)', username: 'beer', pin: '9999', role: 'admin' as const };
            }
            if (p.id === 'u-2' && !p.username) return { ...p, username: 'bee' };
            if (p.id === 'u-3' && !p.username) return { ...p, username: 'a' };
            if (p.id === 'u-4' && !p.username) return { ...p, username: 'mom' };
            return p;
          });
          
          if (!migrated.some(p => p.id === 'u-5')) {
            migrated.push({ id: 'u-5', name: 'มิน (Admin)', username: 'min', role: 'admin' as const, pin: '7777', creditLimit: 0, spentAmount: 0 });
          }
          
          localStorage.setItem('fp_profiles', JSON.stringify(migrated));
          return migrated;
        }
        return parsed;
      } catch (e) {
        return INITIAL_PROFILES;
      }
    }
    return INITIAL_PROFILES;
  });

  const [requests, setRequests] = useState<PurchaseRequest[]>(() => {
    const saved = localStorage.getItem('fp_requests');
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [installments, setInstallments] = useState<BillInstallment[]>(() => {
    const saved = localStorage.getItem('fp_installments');
    return saved ? JSON.parse(saved) : INITIAL_INSTALLMENTS;
  });

  // --- UI Navigation / Session States ---
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('fp_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserProfile;
        if (parsed.id === 'u-1' && (parsed.name.includes('คุณพ่อ') || parsed.pin === '1234')) {
          const updated = { ...parsed, name: 'เบียร์ (Admin)', username: 'beer', pin: '9999' };
          localStorage.setItem('fp_current_user', JSON.stringify(updated));
          return updated;
        }
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<'main' | 'requests' | 'members' | 'transactions' | 'guide'>('main');
  const [transactionSelectedMemberId, setTransactionSelectedMemberId] = useState<string>('');
  
  // --- Admin Search Query States ---
  const [searchRequests, setSearchRequests] = useState<string>('');
  const [searchMembers, setSearchMembers] = useState<string>('');
  const [searchTxMembers, setSearchTxMembers] = useState<string>('');
  const [searchTxRequests, setSearchTxRequests] = useState<string>('');
  const [searchTxInstallments, setSearchTxInstallments] = useState<string>('');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [profileToLogin, setProfileToLogin] = useState<UserProfile | null>(null);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [pinInput, setPinInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // --- Forms & Interactive States ---
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPin, setNewMemberPin] = useState('');
  const [newMemberLimit, setNewMemberLimit] = useState<number>(10000);
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'member'>('member');
  const [showAddMember, setShowAddMember] = useState(false);

  // Installment Request Form State
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState<string>('');
  const [installmentTerm, setInstallmentTerm] = useState<number>(3);
  const [requestType, setRequestType] = useState<'pay_later' | 'cash_loan'>('pay_later');
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Bill Notification State
  const [notifyingBill, setNotifyingBill] = useState<BillInstallment | null>(null);
  const [notifyingGroup, setNotifyingGroup] = useState<{ dueDateKey: string; installments: BillInstallment[] } | null>(null);
  const [memberViewMode, setMemberViewMode] = useState<'grouped' | 'individual'>('grouped');
  const [memberActiveTab, setMemberActiveTab] = useState<'form' | 'schedule' | 'history'>('form');
  const [adminViewMode, setAdminViewMode] = useState<'grouped' | 'individual'>('grouped');
  const [notificationNotes, setNotificationNotes] = useState('');
  const [slipPreviewUrl, setSlipPreviewUrl] = useState<string | null>(null);
  const [slipImageName, setSlipImageName] = useState<string>('');
  const [viewingAdminSlip, setViewingAdminSlip] = useState<string | null>(null);

  // Selected Member Details (for Admin View)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [customCreditLimitInput, setCustomCreditLimitInput] = useState<string>('');
  const [customSpentAmountInput, setCustomSpentAmountInput] = useState<string>('');
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('fp_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('fp_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('fp_installments', JSON.stringify(installments));
  }, [installments]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('fp_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('fp_current_user');
    }
  }, [currentUser]);

  // Sync currentUser with profiles modifications
  useEffect(() => {
    if (currentUser) {
      const freshUser = profiles.find(p => p.id === currentUser.id);
      if (freshUser && (freshUser.spentAmount !== currentUser.spentAmount || freshUser.creditLimit !== currentUser.creditLimit || freshUser.name !== currentUser.name || freshUser.role !== currentUser.role)) {
        setCurrentUser(freshUser);
      }
    }
  }, [profiles, currentUser]);

  // Dynamic calculated totals
  const totalDebtOutstanding = installments
    .filter(i => i.status !== 'paid')
    .reduce((sum, i) => sum + i.amount, 0);

  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;

  const totalFamilyLimit = profiles
    .filter(p => p.role === 'member')
    .reduce((sum, p) => sum + p.creditLimit, 0);

  const totalFamilySpent = profiles
    .filter(p => p.role === 'member')
    .reduce((sum, p) => sum + p.spentAmount, 0);

  const familyLimitRemaining = totalFamilyLimit - totalFamilySpent;

  // --- Auth Handlers ---
  const findProfileByInput = (input: string): UserProfile | null => {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) return null;

    // Check by exact username
    let found = profiles.find(p => p.username?.toLowerCase() === trimmed);
    if (found) return found;

    // Check by exact name (case-insensitive)
    found = profiles.find(p => p.name.toLowerCase() === trimmed);
    if (found) return found;

    // Check if name contains input or username contains input
    found = profiles.find(p => p.name.toLowerCase().includes(trimmed) || (p.username && p.username.toLowerCase().includes(trimmed)));
    if (found) return found;

    return null;
  };

  const handleProfileSelect = (profile: UserProfile) => {
    setProfileToLogin(profile);
    setUsernameInput(profile.username || profile.name);
    setPinInput('');
    setLoginError('');
  };

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const matched = profileToLogin || findProfileByInput(usernameInput);
    if (!matched) {
      setLoginError('ไม่พบชื่อผู้ใช้งานนี้ กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    if (pinInput === matched.pin) {
      setCurrentUser(matched);
      setProfileToLogin(null);
      setUsernameInput('');
      setPinInput('');
      setLoginError('');
      setActiveTab('main');
    } else {
      setLoginError('รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    }
  };

  // Auto-validate PIN on reaching 4 characters
  useEffect(() => {
    if (pinInput.length === 4) {
      const matched = profileToLogin || findProfileByInput(usernameInput);
      if (matched) {
        if (pinInput === matched.pin) {
          setCurrentUser(matched);
          setProfileToLogin(null);
          setUsernameInput('');
          setPinInput('');
          setLoginError('');
          setActiveTab('main');
        } else {
          setLoginError('รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
          // Auto-clear the pin input after a short delay so user can retry
          const timer = setTimeout(() => {
            setPinInput('');
          }, 1000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [pinInput, profileToLogin, usernameInput, profiles]);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const performLogout = () => {
    setCurrentUser(null);
    setActiveTab('main');
    setShowLogoutConfirm(false);
  };

  // --- Admin Logic ---
  const handleApproveRequest = (req: PurchaseRequest) => {
    // Generate installments
    const installmentsToAdd: BillInstallment[] = [];
    const today = new Date();
    
    for (let i = 1; i <= req.installments; i++) {
      const dueDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const formattedDueDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-01`;
      
      installmentsToAdd.push({
        id: `inst-${req.id}-${i}`,
        requestId: req.id,
        userId: req.userId,
        userName: req.userName,
        productName: req.productName,
        monthIndex: i,
        dueDate: formattedDueDate,
        amount: req.monthlyAmount,
        status: 'unpaid',
        requestType: req.requestType || 'pay_later'
      });
    }

    // Update status in requests
    const updatedRequests = requests.map(r => 
      r.id === req.id ? { ...r, status: 'approved' as const, approvedDate: today.toISOString().split('T')[0] } : r
    );

    // Update spent amount in profiles
    const updatedProfiles = profiles.map(p => 
      p.id === req.userId ? { ...p, spentAmount: p.spentAmount + req.totalPrice } : p
    );

    setRequests(updatedRequests);
    setInstallments([...installments, ...installmentsToAdd]);
    setProfiles(updatedProfiles);
  };

  const handleRejectRequest = (reqId: string) => {
    const updatedRequests = requests.map(r => 
      r.id === reqId ? { ...r, status: 'rejected' as const } : r
    );
    setRequests(updatedRequests);
  };

  const handleMarkAsPaid = (installment: BillInstallment) => {
    // Mark the single installment as paid
    const updatedInstallments = installments.map(inst => 
      inst.id === installment.id ? { ...inst, status: 'paid' as const } : inst
    );

    // Re-calculate the total remaining unpaid amount for this request to adjust member's spentAmount
    // We deduct the paid installment amount from the spentAmount of the user
    const updatedProfiles = profiles.map(p => {
      if (p.id === installment.userId) {
        const newSpent = Math.max(0, p.spentAmount - installment.amount);
        return { ...p, spentAmount: newSpent };
      }
      return p;
    });

    setInstallments(updatedInstallments);
    setProfiles(updatedProfiles);
  };

  const handleMarkGroupAsPaid = (userId: string, targetInstallments: BillInstallment[]) => {
    // Mark all non-paid installments in this list as paid
    const pendingToPay = targetInstallments.filter(i => i.status !== 'paid');
    if (pendingToPay.length === 0) return;

    const targetIds = pendingToPay.map(t => t.id);
    const totalDeductedAmount = pendingToPay.reduce((sum, t) => sum + t.amount, 0);

    const updatedInstallments = installments.map(inst => 
      targetIds.includes(inst.id) ? { ...inst, status: 'paid' as const } : inst
    );

    const updatedProfiles = profiles.map(p => {
      if (p.id === userId) {
        const newSpent = Math.max(0, p.spentAmount - totalDeductedAmount);
        return { ...p, spentAmount: newSpent };
      }
      return p;
    });

    setInstallments(updatedInstallments);
    setProfiles(updatedProfiles);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberPin) return;

    const newProfile: UserProfile = {
      id: `u-${Date.now()}`,
      name: newMemberName + (newMemberRole === 'admin' ? ' (Admin)' : ''),
      role: newMemberRole,
      pin: newMemberPin,
      creditLimit: newMemberRole === 'member' ? newMemberLimit : 0,
      spentAmount: 0
    };

    setProfiles([...profiles, newProfile]);
    setNewMemberName('');
    setNewMemberPin('');
    setNewMemberLimit(10000);
    setNewMemberRole('member');
    setShowAddMember(false);
  };

  const handleUpdateLimitAndSpent = (userId: string, newLimit: number, newSpent: number) => {
    setProfiles(profiles.map(p => 
      p.id === userId ? { ...p, creditLimit: newLimit, spentAmount: newSpent } : p
    ));
    setCustomCreditLimitInput('');
    setCustomSpentAmountInput('');
    setSelectedMemberId(null);
  };

  const handleDeleteMember = (userId: string) => {
    setProfiles(profiles.filter(p => p.id !== userId));
    setDeletingMemberId(null);
    if (currentUser?.id === userId) {
      setCurrentUser(null);
    }
  };

  const handleRemindInstallment = (installmentId: string) => {
    setInstallments(prev => prev.map(inst => 
      inst.id === installmentId ? { ...inst, reminded: true } : inst
    ));
    
    const inst = installments.find(i => i.id === installmentId);
    if (inst) {
      alert(`[แจ้งเตือน] ส่งแจ้งเตือนชำระเงินงวด ฿${inst.amount.toLocaleString()} (${inst.productName}) ของ ${inst.userName} สำเร็จ!`);
    }
  };

  const handleRemindGroup = (userId: string, targetInstallments: BillInstallment[]) => {
    const targetIds = targetInstallments.filter(i => i.status !== 'paid').map(t => t.id);
    setInstallments(prev => prev.map(inst => 
      targetIds.includes(inst.id) ? { ...inst, reminded: true } : inst
    ));
    
    const name = targetInstallments[0]?.userName || 'สมาชิก';
    alert(`[แจ้งเตือน] ส่งแจ้งเตือนชำระงวดค้างทั้งหมดในเดือนนี้ของ ${name} สำเร็จแล้ว!`);
  };

  // --- Member Logic ---
  const handleCalculateInstallment = () => {
    const price = parseFloat(productPrice) || 0;
    if (price <= 0) return { monthly: 0, total: 0, interest: 0 };

    const monthly = price / installmentTerm;
    return {
      monthly: Math.round(monthly * 100) / 100,
      total: price,
      interest: 0
    };
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const price = parseFloat(productPrice) || 0;
    if (!productName.trim() || price <= 0) {
      setRequestError(
        requestType === 'cash_loan'
          ? 'กรุณากรอกวัตถุประสงค์การกู้ยืมเงินและจำนวนเงินที่ถูกต้อง'
          : 'กรุณากรอกชื่อสินค้าและราคาสินค้าที่ถูกต้อง'
      );
      return;
    }

    const { monthly, total } = handleCalculateInstallment();

    // Check credit limit availability (including pending requests to prevent over-allocation)
    const pendingTotal = requests
      .filter(r => r.userId === currentUser.id && r.status === 'pending')
      .reduce((sum, r) => sum + r.totalPrice, 0);
    const availableCredit = currentUser.creditLimit - currentUser.spentAmount - pendingTotal;
    if (total > availableCredit) {
      setRequestError(
        `วงเงินคงเหลือไม่พอชำระ! ยอดรวมคือ ฿${total.toLocaleString()} แต่วงเงินคงเหลือหักรายการที่รออนุมัติของคุณคือ ฿${availableCredit.toLocaleString()}`
      );
      return;
    }

    const newRequest: PurchaseRequest = {
      id: `req-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      productName: productName,
      totalPrice: total,
      installments: installmentTerm,
      monthlyAmount: monthly,
      interestRate: 0,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0],
      requestType: requestType
    };

    setRequests([newRequest, ...requests]);
    setProductName('');
    setProductPrice('');
    setInstallmentTerm(3);
    setRequestSuccess(
      requestType === 'cash_loan'
        ? 'ส่งคำขอกู้ยืมเงินสดสำเร็จแล้ว! รอกรรมการ (Admin) ตรวจสอบและอนุมัติ'
        : 'ส่งคำขอผ่อนชำระสินค้าสำเร็จแล้ว! รอกรรมการ (Admin) ตรวจสอบและอนุมัติ'
    );
    setRequestError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlipImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseDemoSlip = () => {
    if (!notifyingBill && !notifyingGroup) return;
    const amount = notifyingGroup
      ? notifyingGroup.installments.reduce((sum, i) => sum + i.amount, 0)
      : (notifyingBill?.amount || 0);
    const name = currentUser?.name || 'สมาชิกครอบครัว';
    const slip = generateDemoSlip('kbank', amount, name);
    setSlipPreviewUrl(slip);
    setSlipImageName(`kbank_slip_${amount}_baht.svg`);
  };

  const handleClearSlip = () => {
    setSlipPreviewUrl(null);
    setSlipImageName('');
    const input = document.getElementById('slip-upload-input') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleNotifyPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyingBill && !notifyingGroup) return;

    if (notifyingGroup) {
      const targetIds = notifyingGroup.installments.map(i => i.id);
      const updatedInstallments = installments.map(inst => 
        targetIds.includes(inst.id) 
          ? { 
              ...inst, 
              status: 'notified' as const, 
              notificationDate: new Date().toISOString().split('T')[0], 
              notificationNotes: slipImageName 
                ? `แนบสลิป (รวมชำระเดือน ${getThaiMonthYearFromKey(notifyingGroup.dueDateKey)}): ${slipImageName}` 
                : `ชำระรวมประจำเดือน ${getThaiMonthYearFromKey(notifyingGroup.dueDateKey)}`,
              slipImage: slipPreviewUrl || undefined
            } 
          : inst
      );
      setInstallments(updatedInstallments);
      setNotifyingGroup(null);
    } else if (notifyingBill) {
      const updatedInstallments = installments.map(inst => 
        inst.id === notifyingBill.id 
          ? { 
              ...inst, 
              status: 'notified' as const, 
              notificationDate: new Date().toISOString().split('T')[0], 
              notificationNotes: slipImageName ? `แนบสลิป: ${slipImageName}` : 'แนบสลิปโอนเงิน',
              slipImage: slipPreviewUrl || undefined
            } 
          : inst
      );
      setInstallments(updatedInstallments);
      setNotifyingBill(null);
    }

    setNotificationNotes('');
    setSlipPreviewUrl(null);
    setSlipImageName('');
  };

  // --- Reset Sandbox Helper ---
  const handleResetDemo = () => {
    if (window.confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
      localStorage.removeItem('fp_profiles');
      localStorage.removeItem('fp_requests');
      localStorage.removeItem('fp_installments');
      localStorage.removeItem('fp_current_user');
      setProfiles(INITIAL_PROFILES);
      setRequests(INITIAL_REQUESTS);
      setInstallments(INITIAL_INSTALLMENTS);
      setCurrentUser(null);
      setProfileToLogin(null);
      setActiveTab('main');
    }
  };

  const calc = handleCalculateInstallment();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden antialiased">
      
      {/* Top Banner indicating Sandbox / Quick Switch Profile */}
      <div className="bg-slate-900 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-medium border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
          <span className="opacity-90">ระบบทดลอง (Sandbox Mode): สลับบทบาทเพื่อจำลองการทำรายการได้ทันที</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="opacity-75">สลับโปรไฟล์ด่วน:</span>
          <div className="flex gap-1.5">
            {profiles.map(p => (
              <button 
                key={p.id} 
                onClick={() => {
                  setCurrentUser(p);
                  setProfileToLogin(null);
                  setPinInput('');
                  setActiveTab('main');
                }}
                className={`px-2 py-0.5 rounded transition ${currentUser?.id === p.id ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                {p.name.split(' ')[0]}
              </button>
            ))}
          </div>
          <button 
            onClick={handleResetDemo}
            className="ml-2 px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition flex items-center gap-1"
            title="รีเซ็ตฐานข้อมูลจำลอง"
          >
            <RefreshCw className="w-3 h-3" /> รีเซ็ตเดโม
          </button>
        </div>
      </div>

      {!currentUser ? (
        // ==========================================
        // LOGIN & PROFILE SELECTION SCREEN
        // ==========================================
        <div className="flex-1 flex items-center justify-center p-6 min-h-[calc(100vh-37px)] bg-gradient-to-tr from-[#9cd4d7] to-[#d7f5f6]">
          <div className="relative w-full max-w-[380px] bg-[#2e6da4] rounded-[2rem] shadow-xl px-8 pt-16 pb-12 text-white">
            
            {/* Top Overlapping Avatar Circle */}
            <div className="w-28 h-28 bg-[#2e6da4] rounded-full flex items-center justify-center border-[6px] border-[#d7f5f6] shadow-md absolute -top-14 left-1/2 -translate-x-1/2 overflow-hidden">
              <img 
                src={muhammadLogo} 
                alt="Muhammad Pay Later Mascot" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold tracking-[0.2em] text-center mb-8 text-white">LOGIN</h2>

            {/* Form */}
            <form 
              onSubmit={handlePinSubmit} 
              className="space-y-4"
            >
              {/* Username Input with Suggestions */}
              <div className="flex items-center bg-white rounded-md px-3.5 py-2.5 shadow-inner border border-slate-200">
                <User className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  list="profiles-list"
                  placeholder="Username"
                  value={usernameInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUsernameInput(val);
                    const matched = findProfileByInput(val);
                    setProfileToLogin(matched);
                    if (loginError) setLoginError('');
                  }}
                  className="w-full bg-transparent text-slate-700 text-sm font-medium focus:outline-none pl-3 pr-2 placeholder:text-slate-400"
                />
                <datalist id="profiles-list">
                  {profiles.map((p) => (
                    <option key={p.id} value={p.username || p.name}>
                      {p.name}
                    </option>
                  ))}
                </datalist>
                {usernameInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setUsernameInput('');
                      setProfileToLogin(null);
                      if (loginError) setLoginError('');
                    }}
                    className="text-slate-400 hover:text-slate-600 text-xs shrink-0 px-1 cursor-pointer mr-1"
                    title="ล้างข้อมูล"
                  >
                    ✕
                  </button>
                )}
                <div className="text-slate-400 pointer-events-none shrink-0">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>

              {/* Password/PIN Input */}
              <div className="flex items-center bg-white rounded-md px-3.5 py-2.5 shadow-inner border border-slate-200">
                <Lock className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="password"
                  placeholder="Password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-transparent text-slate-700 text-sm font-medium focus:outline-none pl-3 pr-2 placeholder:text-slate-400"
                />
              </div>

              {/* Error messages if any */}
              {loginError && (
                <p className="text-xs text-red-100 font-bold text-center bg-red-900/40 py-1.5 px-3 rounded-lg animate-pulse">
                  {loginError}
                </p>
              )}

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="rounded border-transparent bg-white/20 text-sky-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer" 
                  />
                  <span>Remember me</span>
                </label>
              </div>

              {/* Login Button */}
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className="w-full py-3 px-10 bg-[#3ca4d8] hover:bg-[#2b90c4] active:scale-[0.98] text-white font-extrabold text-sm rounded-full tracking-wider shadow-md transition-all cursor-pointer uppercase"
                >
                  LOGIN
                </button>
              </div>
            </form>

            {/* Forgot Credentials Footer Link */}
            <div className="text-center mt-6">
              <span className="text-xs text-white/70 hover:text-white transition-colors cursor-pointer font-medium hover:underline">
                Forgot Username / Password?
              </span>
            </div>

          </div>
        </div>
      ) : (
        // ==========================================
        // APPLICATION WORKSPACE (LOGGED IN)
        // ==========================================
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          
          {/* Mobile Sticky Header */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-xs flex-shrink-0">
                <img 
                  src={muhammadLogo} 
                  alt="Mascot" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-extrabold text-sm text-slate-800 tracking-wide">Muhammad Family PayLater</span>
            </div>
            
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition cursor-pointer"
              title="เปิดเมนู"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Sidebar Slide-over Drawer */}
          {isMobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-50 flex">
              {/* Dark backdrop overlay */}
              <div 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              
              {/* Sliding Panel */}
              <div className="relative w-72 max-w-xs bg-white h-full flex flex-col p-6 shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out translate-x-0">
                {/* Header with Close Button */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-xs flex-shrink-0">
                      <img 
                        src={muhammadLogo} 
                        alt="Mascot" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="font-bold text-xs text-slate-800 uppercase tracking-wide">PayLater Menu</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    title="ปิดเมนู"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* User Information Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ผู้ใช้ปัจจุบัน</p>
                  <p className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mt-0.5">
                    <span className={`inline-block w-2 h-2 rounded-full ${currentUser.role === 'admin' ? 'bg-indigo-600' : 'bg-sky-500'}`}></span>
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 uppercase font-medium">
                    {currentUser.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'สมาชิกครอบครัว'}
                  </p>
                  {currentUser.role === 'member' && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex justify-between items-center">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">วงเงินคงเหลือ</p>
                        <p className="text-xs font-bold text-emerald-600">
                          ฿ {(currentUser.creditLimit - currentUser.spentAmount).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">ยอดค้างรวม</p>
                        <p className="text-xs font-bold text-rose-600">
                          ฿ {installments
                            .filter(i => i.userId === currentUser.id && i.status !== 'paid')
                            .reduce((sum, i) => sum + i.amount, 0)
                            .toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Menu Buttons */}
                <div className="flex flex-col gap-1.5 flex-1">
                  <button
                    onClick={() => {
                      setActiveTab('main');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                      activeTab === 'main'
                        ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Layers className="w-5 h-5 text-indigo-600 shrink-0" />
                    <span>แผงควบคุมหลัก</span>
                  </button>

                  {currentUser.role === 'member' && (
                    <div className="pl-3 border-l-2 border-indigo-100 flex flex-col gap-1.5 mt-1 mb-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMemberActiveTab('form');
                          setActiveTab('main');
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                          activeTab === 'main' && memberActiveTab === 'form'
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>ทำรายการใหม่</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMemberActiveTab('schedule');
                          setActiveTab('main');
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-bold transition relative cursor-pointer ${
                          activeTab === 'main' && memberActiveTab === 'schedule'
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>ตารางผ่อนชำระ</span>
                        {installments.some(i => i.userId === currentUser.id && i.status === 'unpaid' && i.reminded) && (
                          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMemberActiveTab('history');
                          setActiveTab('main');
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                          activeTab === 'main' && memberActiveTab === 'history'
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>ประวัติและสถานะ</span>
                      </button>
                    </div>
                  )}

                  {currentUser.role === 'admin' && (
                    <>
                      <button
                        onClick={() => {
                          setActiveTab('requests');
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                          activeTab === 'requests'
                            ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                          <span>คำขอผ่อนชำระ</span>
                        </div>
                        {pendingRequestsCount > 0 && (
                          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {pendingRequestsCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('members');
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                          activeTab === 'members'
                            ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Users className="w-5 h-5 text-indigo-600 shrink-0" />
                        <span>จัดการสมาชิกและวงเงิน</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('transactions');
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                          activeTab === 'transactions'
                            ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <History className="w-5 h-5 text-indigo-600 shrink-0" />
                        <span>ประวัติธุรกรรมสมาชิก</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      setActiveTab('guide');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                      activeTab === 'guide'
                        ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Info className="w-5 h-5 text-indigo-600 shrink-0" />
                    <span>คู่มือสร้างระบบ (Thai Guide)</span>
                  </button>
                </div>

                {/* Logout Button */}
                <div className="border-t border-slate-100 pt-4 mt-auto">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 text-red-500 hover:bg-red-50 p-2.5 rounded-lg font-bold text-sm w-full transition cursor-pointer"
                  >
                    <LogOut className="w-5 h-5 shrink-0" />
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sidebar Left Navigation - Desktop Only */}
          <aside className={`hidden md:flex flex-col ${isSidebarCollapsed ? 'w-20 p-4' : 'w-64 p-6'} border-r border-slate-200 bg-white gap-2 shrink-0 transition-all duration-300`}>
            
            {/* Collapse/Expand Toggle button */}
            <div className={`hidden md:flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} mb-1 border-b border-slate-100 pb-3`}>
              {!isSidebarCollapsed && (
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  เมนูนำทาง
                </span>
              )}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                title={isSidebarCollapsed ? "ขยายเมนู" : "ย่อเมนู"}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Active User Summary card in Sidebar */}
            {isSidebarCollapsed ? (
              <div 
                className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-xl p-2.5 mb-2 hover:bg-slate-100 transition-colors"
                title={`ผู้ใช้: ${currentUser.name} (${currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิก'})`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-white text-sm shadow-xs ${
                  currentUser.role === 'admin' ? 'bg-indigo-600' : 'bg-sky-500'
                }`}>
                  {currentUser.name.slice(0, 2)}
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ผู้ใช้ปัจจุบัน</p>
                <p className="font-bold text-slate-800 text-base flex items-center gap-1.5 mt-0.5">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${currentUser.role === 'admin' ? 'bg-indigo-600' : 'bg-sky-500'}`}></span>
                  {currentUser.name}
                </p>
                <p className="text-xs text-slate-500 mt-1 uppercase">
                  {currentUser.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'สมาชิกครอบครัว'}
                </p>
                {currentUser.role === 'member' && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ยอดเงินที่ค้างชำระทั้งหมดรวมทุกงวด</p>
                    <p className="text-sm font-bold text-rose-600">
                      ฿ {installments
                        .filter(i => i.userId === currentUser.id && i.status !== 'paid')
                        .reduce((sum, i) => sum + i.amount, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Sidebar Buttons */}
            <button
              onClick={() => setActiveTab('main')}
              title={isSidebarCollapsed ? "แผงควบคุมหลัก" : undefined}
              className={`w-full flex items-center p-3 rounded-lg font-medium transition cursor-pointer ${
                isSidebarCollapsed ? 'justify-center' : 'gap-3 text-left'
              } ${
                activeTab === 'main'
                  ? 'bg-indigo-50 text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Layers className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span>แผงควบคุมหลัก</span>}
            </button>

            {currentUser.role === 'member' && (
              <div className={`flex flex-col gap-1.5 ${isSidebarCollapsed ? 'items-center py-1 border-t border-b border-slate-100 my-1' : 'pl-4 border-l-2 border-indigo-100 ml-4.5 mt-1 mb-2'}`}>
                <button
                  type="button"
                  onClick={() => {
                    setMemberActiveTab('form');
                    setActiveTab('main');
                  }}
                  title={isSidebarCollapsed ? "ทำรายการใหม่" : undefined}
                  className={`w-full flex items-center p-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    isSidebarCollapsed ? 'justify-center' : 'gap-2 text-left'
                  } ${
                    activeTab === 'main' && memberActiveTab === 'form'
                      ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4 shrink-0 text-indigo-600" />
                  {!isSidebarCollapsed && <span>ทำรายการใหม่</span>}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMemberActiveTab('schedule');
                    setActiveTab('main');
                  }}
                  title={isSidebarCollapsed ? "ตารางผ่อนชำระ" : undefined}
                  className={`w-full flex items-center p-2 rounded-lg text-xs font-bold transition relative cursor-pointer ${
                    isSidebarCollapsed ? 'justify-center' : 'gap-2 text-left'
                  } ${
                    activeTab === 'main' && memberActiveTab === 'schedule'
                      ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Calendar className="w-4 h-4 shrink-0 text-indigo-600" />
                  {!isSidebarCollapsed && <span>ตารางผ่อนชำระ</span>}
                  {installments.some(i => i.userId === currentUser.id && i.status === 'unpaid' && i.reminded) && (
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMemberActiveTab('history');
                    setActiveTab('main');
                  }}
                  title={isSidebarCollapsed ? "ประวัติและสถานะ" : undefined}
                  className={`w-full flex items-center p-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    isSidebarCollapsed ? 'justify-center' : 'gap-2 text-left'
                  } ${
                    activeTab === 'main' && memberActiveTab === 'history'
                      ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4 shrink-0 text-indigo-600" />
                  {!isSidebarCollapsed && <span>ประวัติและสถานะ</span>}
                </button>
              </div>
            )}

            {currentUser.role === 'admin' ? (
              <>
                <button
                  onClick={() => setActiveTab('requests')}
                  title={isSidebarCollapsed ? "คำขอผ่อนชำระ" : undefined}
                  className={`w-full flex items-center p-3 rounded-lg font-medium transition cursor-pointer ${
                    isSidebarCollapsed ? 'justify-center relative' : 'justify-between text-left'
                  } ${
                    activeTab === 'requests'
                      ? 'bg-indigo-50 text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 shrink-0" />
                    {!isSidebarCollapsed && <span>คำขอผ่อนชำระ</span>}
                  </div>
                  {pendingRequestsCount > 0 && (
                    isSidebarCollapsed ? (
                      <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[8px] font-bold h-4 w-4 flex items-center justify-center rounded-full animate-bounce">
                        {pendingRequestsCount}
                      </span>
                    ) : (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                        {pendingRequestsCount}
                      </span>
                    )
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('members')}
                  title={isSidebarCollapsed ? "จัดการสมาชิกและวงเงิน" : undefined}
                  className={`w-full flex items-center p-3 rounded-lg font-medium transition cursor-pointer ${
                    isSidebarCollapsed ? 'justify-center' : 'gap-3 text-left'
                  } ${
                    activeTab === 'members'
                      ? 'bg-indigo-50 text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Users className="w-5 h-5 shrink-0" />
                  {!isSidebarCollapsed && <span>จัดการสมาชิกและวงเงิน</span>}
                </button>

                <button
                  onClick={() => setActiveTab('transactions')}
                  title={isSidebarCollapsed ? "ประวัติธุรกรรมสมาชิก" : undefined}
                  className={`w-full flex items-center p-3 rounded-lg font-medium transition cursor-pointer ${
                    isSidebarCollapsed ? 'justify-center' : 'gap-3 text-left'
                  } ${
                    activeTab === 'transactions'
                      ? 'bg-indigo-50 text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <History className="w-5 h-5 shrink-0" />
                  {!isSidebarCollapsed && <span>ประวัติธุรกรรมสมาชิก</span>}
                </button>
              </>
            ) : null}

            <button
              onClick={() => setActiveTab('guide')}
              title={isSidebarCollapsed ? "คู่มือสร้างระบบ (Thai Guide)" : undefined}
              className={`w-full flex items-center p-3 rounded-lg font-medium transition cursor-pointer ${
                isSidebarCollapsed ? 'justify-center' : 'gap-3 text-left'
              } ${
                activeTab === 'guide'
                  ? 'bg-indigo-50 text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Info className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span>คู่มือสร้างระบบ (Thai Guide)</span>}
            </button>

            <div className="mt-auto border-t border-slate-100 pt-4">
              <button
                onClick={handleLogout}
                title={isSidebarCollapsed ? "ออกจากระบบ" : undefined}
                className={`flex items-center text-red-500 hover:bg-red-50 p-3 rounded-lg font-semibold w-full transition cursor-pointer ${
                  isSidebarCollapsed ? 'justify-center' : 'gap-3 text-left'
                }`}
              >
                <LogOut className="w-5 h-5 shrink-0" />
                {!isSidebarCollapsed && <span>ออกจากระบบ</span>}
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-6 md:gap-8 overflow-y-auto">
            
            {/* Header Area inside main layout */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                  {activeTab === 'main' && 'Dashboard'}
                  {activeTab === 'requests' && 'ตรวจสอบและอนุมัติคำขอผ่อน'}
                  {activeTab === 'members' && 'จัดการเครดิตวงเงินสมาชิก'}
                  {activeTab === 'transactions' && 'ประวัติธุรกรรมสมาชิกรายบุคคล'}
                  {activeTab === 'guide' && 'คำแนะนำทางเทคนิค & โครงสร้างข้อมูล'}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {currentUser.role === 'admin' 
                    ? `สถานะแอดมิน: คุณกำลังจัดการบัญชีหลัก Shopee / TikTok ของบ้าน` 
                    : `สถานะสมาชิก: วงเงินเครดิตที่บ้านอนุมัติให้ใช้`}
                </p>
              </div>
              <div className="flex items-center sm:justify-end">
                <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono">
                  {currentDateTime.toLocaleString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {/* ERROR / SUCCESS NOTIFICATIONS FOR WHOLE PAGE IF ANY */}
            {requestSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">สำเร็จ</p>
                  <p className="text-xs text-emerald-700 mt-0.5">{requestSuccess}</p>
                </div>
                <button onClick={() => setRequestSuccess(null)} className="ml-auto text-xs text-emerald-600 font-bold hover:underline">ปิด</button>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB: MAIN - ADMIN VIEW OR MEMBER VIEW                     */}
            {/* ========================================================= */}
            {activeTab === 'main' && (
              <>
                {currentUser.role === 'admin' ? (
                  // --- ADMIN MAIN VIEW ---
                  <>
                    {/* Hero Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100 relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
                          <DollarSign className="w-36 h-36" />
                        </div>
                        <p className="text-indigo-100 text-sm font-medium">ยอดหนี้ค้างชำระรวมของครอบครัว</p>
                        <h2 className="text-3xl font-bold mt-1">฿ {totalDebtOutstanding.toLocaleString()}</h2>
                        <p className="mt-4 text-xs text-indigo-200 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" /> ยอดค้างชำระแยกเป็นรายคนและงวดผ่อนด้านล่าง
                        </p>
                      </div>

                      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <p className="text-slate-500 text-sm font-medium">คำขอซื้อรอการพิจารณา</p>
                        <h2 className="text-3xl font-bold mt-1 text-slate-800 flex items-baseline gap-1.5">
                          {pendingRequestsCount} 
                          <span className="text-slate-400 text-base font-normal">รายการ</span>
                        </h2>
                        {pendingRequestsCount > 0 ? (
                          <button 
                            onClick={() => setActiveTab('requests')}
                            className="mt-4 text-xs text-amber-600 font-bold flex items-center gap-1 hover:underline"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> ต้องการการตัดสินใจอนุมัติคลิกที่นี่
                          </button>
                        ) : (
                          <p className="mt-4 text-xs text-slate-400">ไม่มีคำค้างขอซื้อในขณะนี้</p>
                        )}
                      </div>

                      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <p className="text-slate-500 text-sm font-medium">วงเงินรวมที่ใช้ไป / วงเงินทั้งหมด</p>
                        <h2 className="text-3xl font-bold mt-1 text-slate-800">
                          ฿ {totalFamilySpent.toLocaleString()}
                          <span className="text-slate-400 text-lg font-normal"> / ฿ {totalFamilyLimit.toLocaleString()}</span>
                        </h2>
                        <div className="mt-4">
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                              style={{ width: `${totalFamilyLimit > 0 ? (totalFamilySpent / totalFamilyLimit) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5">
                            <span>ใช้ไปแล้ว {totalFamilyLimit > 0 ? Math.round((totalFamilySpent / totalFamilyLimit) * 100) : 0}%</span>
                            <span>วงเงินเหลือว่าง: ฿ {familyLimitRemaining.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Main Section Content Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                      {/* Left: Active Members List (2 Columns) */}
                      <div className="lg:col-span-2 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-slate-500" /> สมาชิกครอบครัว
                          </h3>
                          <button 
                            onClick={() => setActiveTab('members')}
                            className="text-indigo-600 text-xs font-semibold hover:underline"
                          >
                            + เพิ่ม/จัดการวงเงิน
                          </button>
                        </div>

                        <div className="space-y-3">
                          {profiles.filter(p => p.role === 'member').map(member => {
                            const pct = member.creditLimit > 0 ? (member.spentAmount / member.creditLimit) * 100 : 0;
                            return (
                              <div key={member.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-extrabold text-indigo-600">
                                    {member.name.slice(0, 2)}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-slate-800">{member.name}</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                      ใช้ไป: <span className="font-semibold text-slate-700">฿ {member.spentAmount.toLocaleString()}</span> / ฿ {member.creditLimit.toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-bold text-slate-500">คงเหลือ</p>
                                    <p className="text-sm font-bold text-emerald-600">฿ {(member.creditLimit - member.spentAmount).toLocaleString()}</p>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-300 ${pct > 80 ? 'bg-rose-500' : pct > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                      style={{ width: `${Math.min(100, pct)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right: Recent Requests & Installment Schedule Ledger (3 Columns) */}
                      <div className="lg:col-span-3 flex flex-col gap-6">
                        
                        {/* Pending Approvals quick table */}
                        <div>
                          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-500" /> รายการขอพิจารณาสั่งซื้อล่าสุด
                          </h3>
                          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                              <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">ผู้ขอซื้อ</th>
                                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">สินค้า / ราคารวม</th>
                                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">ผ่อนต่อเดือน</th>
                                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">การอนุมัติ</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {requests.filter(r => r.status === 'pending').length === 0 ? (
                                  <tr>
                                    <td colSpan={4} className="px-4 py-6 text-center text-xs text-slate-400 font-medium">
                                      ไม่มีคำขอซื้อรออนุมัติในขณะนี้
                                    </td>
                                  </tr>
                                ) : (
                                  requests.filter(r => r.status === 'pending').map(req => (
                                    <tr key={req.id} className="hover:bg-slate-50/50 transition">
                                      <td className="px-4 py-3">
                                        <p className="font-semibold text-slate-800 text-xs">{req.userName}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{req.requestDate}</p>
                                      </td>
                                      <td className="px-4 py-3">
                                        <p className="text-xs font-semibold text-slate-700">{req.productName}</p>
                                        <p className="text-xs font-bold text-slate-900 mt-0.5">฿ {req.totalPrice.toLocaleString()}</p>
                                      </td>
                                      <td className="px-4 py-3">
                                        <p className="text-xs font-semibold text-indigo-700">฿ {req.monthlyAmount.toLocaleString()}/ด.</p>
                                        <p className="text-[10px] text-slate-500">ผ่อน {req.installments} เดือน</p>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                          <button 
                                            onClick={() => handleApproveRequest(req)}
                                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded shadow-sm transition"
                                          >
                                            อนุมัติ
                                          </button>
                                          <button 
                                            onClick={() => handleRejectRequest(req.id)}
                                            className="px-2 py-1 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold rounded shadow-sm transition"
                                          >
                                            ปฏิเสธ
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Complete Ledger for Checking Off Payments */}
                        <div>
                          <h3 className="font-bold text-slate-800 mb-3 flex flex-wrap justify-between items-center gap-2">
                            <span className="flex items-center gap-1.5">
                              <Landmark className="w-4 h-4 text-indigo-600" /> ตารางการชำระเงินของงวดต่าง ๆ
                            </span>
                            <div className="bg-slate-100 p-0.5 rounded-lg flex text-[10px] font-semibold border border-slate-200">
                              <button
                                type="button"
                                onClick={() => setAdminViewMode('grouped')}
                                className={`px-2 py-1 rounded-md transition cursor-pointer ${adminViewMode === 'grouped' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                              >
                                แสดงเป็นเดือน (แนะนำ)
                              </button>
                              <button
                                type="button"
                                onClick={() => setAdminViewMode('individual')}
                                className={`px-2 py-1 rounded-md transition cursor-pointer ${adminViewMode === 'individual' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                              >
                                แสดงแยกรายการ
                              </button>
                            </div>
                          </h3>

                          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2">
                              <p className="text-xs font-semibold text-slate-600">กดปุ่ม "ยืนยันยอดเงิน" เมื่อสมาชิกโอนเงินมาให้แล้ว</p>
                              <div className="flex gap-2">
                                <span className="flex items-center gap-1 text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
                                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span> สมาชิกระบุว่าโอนแล้ว
                                </span>
                              </div>
                            </div>
                            <div className="max-h-[480px] overflow-y-auto divide-y divide-slate-100">
                              {installments.length === 0 ? (
                                <p className="p-6 text-center text-xs text-slate-400">ยังไม่มีงวดชำระที่เกิดการผ่อนขึ้นในระบบ</p>
                              ) : adminViewMode === 'grouped' ? (
                                (() => {
                                  // 1. Group installments by month
                                  const groupedMonths: { [monthKey: string]: BillInstallment[] } = {};
                                  installments.forEach(inst => {
                                    const monthKey = getYearMonthKey(inst.dueDate);
                                    if (!groupedMonths[monthKey]) {
                                      groupedMonths[monthKey] = [];
                                    }
                                    groupedMonths[monthKey].push(inst);
                                  });
                                  const sortedMonthKeys = Object.keys(groupedMonths).sort();

                                  return sortedMonthKeys.map(monthKey => {
                                    const monthInsts = groupedMonths[monthKey];
                                    
                                    // 2. Inside this month, group by user
                                    const groupedUsers: { [userId: string]: { userName: string; items: BillInstallment[] } } = {};
                                    monthInsts.forEach(inst => {
                                      if (!groupedUsers[inst.userId]) {
                                        groupedUsers[inst.userId] = { userName: inst.userName, items: [] };
                                      }
                                      groupedUsers[inst.userId].items.push(inst);
                                    });

                                    return (
                                      <div key={monthKey} className="border-b border-slate-100 last:border-b-0">
                                        {/* Month Title Row */}
                                        <div className="bg-slate-50/70 px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                                          <span className="font-bold text-slate-800 text-xs">📅 {getThaiMonthYearFromKey(monthKey)}</span>
                                          <span className="text-[10px] text-slate-500 font-medium">
                                            ยอดรวมงวดทั้งหมด: <span className="font-bold text-slate-800">฿ {monthInsts.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}</span>
                                          </span>
                                        </div>

                                        {/* List of members in this month */}
                                        <div className="divide-y divide-slate-100">
                                          {Object.keys(groupedUsers).map(userId => {
                                            const { userName, items } = groupedUsers[userId];
                                            const totalSum = items.reduce((sum, i) => sum + i.amount, 0);
                                            const unpaidItems = items.filter(i => i.status === 'unpaid');
                                            const notifiedItems = items.filter(i => i.status === 'notified');
                                            const unpaidSum = items.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0);
                                            
                                            // Slips and notes
                                            const slips = items.map(i => i.slipImage).filter(Boolean) as string[];
                                            const notes = items.map(i => i.notificationNotes).filter(Boolean) as string[];
                                            
                                            const isAllPaid = items.every(i => i.status === 'paid');
                                            const isAnyNotified = items.some(i => i.status === 'notified');

                                            return (
                                              <div key={userId} className="p-4 hover:bg-slate-50/20 transition flex flex-col md:flex-row justify-between gap-4">
                                                <div className="space-y-2 flex-1">
                                                  <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-indigo-700">{userName}</span>
                                                    {isAllPaid ? (
                                                      <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">ชำระครบแล้ว</span>
                                                    ) : isAnyNotified ? (
                                                      <span className="text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-300 px-1.5 py-0.5 rounded animate-pulse">สมาชิกระบุโอนแล้ว</span>
                                                    ) : (
                                                      <span className="text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded">ค้างจ่าย</span>
                                                    )}
                                                  </div>

                                                  {/* List of items they ordered and owe for in this month */}
                                                  <ul className="space-y-1 pl-1">
                                                    {items.map(i => (
                                                      <li key={i.id} className="text-xs text-slate-600 flex items-center justify-between max-w-md">
                                                        <span className="flex items-center gap-1">
                                                          <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                                                          <span>{i.productName}</span>
                                                          <span className="text-[10px] text-slate-400 font-medium">(งวดที่ {i.monthIndex})</span>
                                                          {i.reminded && i.status !== 'paid' && (
                                                            <span className="ml-1 text-[9px] text-rose-600 bg-rose-50 border border-rose-200 px-1 py-0.2 rounded font-bold animate-pulse flex items-center gap-0.5">
                                                              <Bell className="w-2.5 h-2.5 text-rose-500" /> แอดมินเตือนแล้ว
                                                            </span>
                                                          )}
                                                        </span>
                                                        <span className="font-semibold text-slate-800">฿ {i.amount.toLocaleString()}</span>
                                                      </li>
                                                    ))}
                                                  </ul>

                                                  {/* Display associated slips */}
                                                  {slips.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                      <p className="text-[10px] text-slate-500 font-semibold">📄 รูปภาพสลิปที่แนบมา:</p>
                                                      <div className="flex gap-2 flex-wrap">
                                                        {slips.map((slip, idx) => (
                                                          <div key={idx} className="relative group inline-block">
                                                            <img 
                                                              src={slip} 
                                                              alt="Slip" 
                                                              className="h-14 rounded border border-slate-200 cursor-pointer hover:opacity-90 shadow-sm transition" 
                                                              onClick={() => setViewingAdminSlip(slip)}
                                                            />
                                                            <span className="absolute bottom-1 right-1 bg-slate-900/75 text-white text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">ขยาย</span>
                                                          </div>
                                                        ))}
                                                      </div>
                                                    </div>
                                                  )}

                                                  {/* Display associated notes */}
                                                  {notes.length > 0 && (
                                                    <div className="text-[11px] bg-slate-50 border border-slate-100 text-slate-600 p-2 rounded mt-1 max-w-lg space-y-0.5">
                                                      {notes.map((note, idx) => (
                                                        <p key={idx} className="font-sans">💬 {note}</p>
                                                      ))}
                                                    </div>
                                                  )}
                                                </div>

                                                {/* Action Panel */}
                                                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2 md:pt-0">
                                                  <div className="text-left md:text-right">
                                                    <p className="text-xs text-slate-400">รวมยอดเดือนนี้</p>
                                                    <p className="text-sm font-extrabold text-slate-950">฿ {totalSum.toLocaleString()}</p>
                                                  </div>
                                                  {!isAllPaid && (
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                      <button
                                                        type="button"
                                                        onClick={() => handleRemindGroup(userId, items)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm border cursor-pointer ${
                                                          items.filter(i => i.status !== 'paid').some(i => i.reminded)
                                                            ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                                                            : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                                                        }`}
                                                      >
                                                        <Bell className={`w-3.5 h-3.5 ${items.filter(i => i.status !== 'paid').some(i => i.reminded) ? 'animate-bounce text-rose-500' : ''}`} />
                                                        {items.filter(i => i.status !== 'paid').some(i => i.reminded) ? 'เตือนซ้ำ' : 'เตือนจ่ายเงิน'}
                                                      </button>

                                                      <button 
                                                        type="button"
                                                        onClick={() => handleMarkGroupAsPaid(userId, items)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer ${
                                                          isAnyNotified 
                                                            ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                        }`}
                                                      >
                                                        <Check className="w-3.5 h-3.5" /> ยืนยันยอดรวม (฿ {unpaidSum.toLocaleString()})
                                                      </button>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  });
                                })()
                              ) : (
                                [...installments].sort((a, b) => {
                                  // Sort notified first, then unpaid, then paid
                                  const statusWeight = { notified: 0, unpaid: 1, paid: 2 };
                                  if (statusWeight[a.status] !== statusWeight[b.status]) {
                                    return statusWeight[a.status] - statusWeight[b.status];
                                  }
                                  return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                                }).map(inst => (
                                  <div key={inst.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/40 transition">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-indigo-700">{inst.userName}</span>
                                        <span className="text-[10px] text-slate-400">| งวดที่ {inst.monthIndex}</span>
                                        {inst.status === 'paid' && (
                                          <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">จ่ายแล้ว</span>
                                        )}
                                        {inst.status === 'notified' && (
                                          <span className="text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-300 px-1.5 py-0.5 rounded animate-pulse">แจ้งโอนแล้ว รอตรวจสอบ</span>
                                        )}
                                        {inst.status === 'unpaid' && (
                                          <span className="text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded">รอชำระ</span>
                                        )}
                                        {inst.reminded && inst.status !== 'paid' && (
                                          <span className="text-[9px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 px-1.5 py-0.5 rounded animate-pulse flex items-center gap-0.5">
                                            <Bell className="w-2.5 h-2.5 text-rose-600" /> ส่งแจ้งเตือนแล้ว
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                        {inst.requestType === 'cash_loan' ? (
                                          <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[9px] px-1.5 py-0.2 rounded font-bold">
                                            กู้เงิน
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] px-1.5 py-0.2 rounded font-bold">
                                            ผ่อนสินค้า
                                          </span>
                                        )}
                                        <p className="text-xs font-semibold text-slate-700">{inst.productName}</p>
                                      </div>
                                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> กำหนดชำระ: {inst.dueDate}
                                      </p>
                                      {inst.status === 'notified' && inst.slipImage && (
                                        <div className="mt-2 space-y-1">
                                          <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                                            <span>📄 รูปภาพสลิปที่แนบมา:</span>
                                          </p>
                                          <div className="inline-block relative group">
                                            <img 
                                              src={inst.slipImage} 
                                              alt="Slip" 
                                              className="h-16 rounded border border-slate-200 cursor-pointer hover:opacity-90 shadow-sm transition" 
                                              onClick={() => setViewingAdminSlip(inst.slipImage || null)}
                                            />
                                            <span className="absolute bottom-1 right-1 bg-slate-900/75 text-white text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">คลิกเพื่อขยาย</span>
                                          </div>
                                        </div>
                                      )}
                                      {inst.status === 'notified' && inst.notificationNotes && (
                                        <div className="text-[11px] bg-amber-50 border border-amber-100 text-slate-700 p-2 rounded mt-1 font-sans">
                                          💬 <span className="font-semibold">ข้อความแนบ:</span> {inst.notificationNotes} 
                                          {inst.notificationDate && <span className="text-slate-400 ml-1">({inst.notificationDate})</span>}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2 md:pt-0">
                                      <div className="text-left md:text-right">
                                        <p className="text-xs text-slate-400">ยอดชำระงวดนี้</p>
                                        <p className="text-sm font-extrabold text-slate-950">฿ {inst.amount.toLocaleString()}</p>
                                      </div>
                                      {inst.status !== 'paid' && (
                                        <div className="flex gap-2 items-center flex-wrap">
                                          <button 
                                            type="button"
                                            onClick={() => handleRemindInstallment(inst.id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm border cursor-pointer ${
                                              inst.reminded
                                                ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                                                : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                                            }`}
                                          >
                                            <Bell className={`w-3.5 h-3.5 ${inst.reminded ? 'animate-bounce text-rose-500' : ''}`} />
                                            {inst.reminded ? 'เตือนซ้ำ' : 'ส่งแจ้งเตือน'}
                                          </button>

                                          <button 
                                            onClick={() => handleMarkAsPaid(inst)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer ${
                                              inst.status === 'notified' 
                                                ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                            }`}
                                          >
                                            <Check className="w-3.5 h-3.5" /> ยืนยันยอดเงิน
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                  ) : (
                    // --- MEMBER MAIN VIEW ---
                    <>
                      {/* Admin Unpaid/Reminded Alert Notification */}
                      {installments.some(i => i.userId === currentUser.id && i.status === 'unpaid' && i.reminded) && (
                        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-rose-500 rounded-full text-white">
                              <Bell className="w-5 h-5 animate-bounce" />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-bold text-rose-950">🚨 แอดมินแจ้งเตือน: คุณมียอดงวดผ่อนชำระค้างอยู่!</p>
                              <p className="text-xs text-rose-700 mt-0.5">
                                กรุณาชำระเงินตามยอดค้าง และทำรายการแจ้งโอนพร้อมแนบสลิปโดยด่วนที่สุด เพื่อความรวดเร็วและรักษาวงเงินเครดิตผ่อนสินค้า
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setMemberActiveTab('schedule')}
                            className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition shadow-sm cursor-pointer whitespace-nowrap"
                          >
                            ไปหน้าชำระเงิน
                          </button>
                        </div>
                      )}

                      {/* User Individual Overview Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Credit Limit Round Card -> Now Outstanding Balance Card */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                          <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">ยอดเงินที่ค้างชำระทั้งหมดรวมทุกงวด</p>
                            <h2 className="text-4xl font-extrabold mt-2 text-rose-600">
                              ฿ {installments
                                .filter(i => i.userId === currentUser.id && i.status !== 'paid')
                                .reduce((sum, i) => sum + i.amount, 0)
                                .toLocaleString()}
                            </h2>
                          </div>
                          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                            <span>ค้างชำระทั้งหมด: {installments.filter(i => i.userId === currentUser.id && i.status !== 'paid').length} งวด</span>
                            <span>วงเงินทั้งหมด: ฿ {currentUser.creditLimit.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Immediate Bill Pending / Due soon */}
                        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100 flex flex-col justify-between">
                          <div>
                            <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider">ยอดเงินที่ต้องผ่อนชำระงวดแรก</p>
                            <h2 className="text-3xl font-bold mt-2">
                              ฿ {installments
                                .filter(i => i.userId === currentUser.id && i.status === 'unpaid')
                                .slice(0, 1)
                                .reduce((sum, i) => sum + i.amount, 0)
                                .toLocaleString() || '0.00'}
                            </h2>
                            <p className="text-[11px] text-indigo-200 mt-1">
                              {installments.filter(i => i.userId === currentUser.id && i.status === 'unpaid').length > 0 
                                ? `กำหนดชำระเร็ว ๆ นี้: ${getThaiShortDate(installments.filter(i => i.userId === currentUser.id && i.status === 'unpaid')[0].dueDate)}`
                                : 'ยังไม่มีกำหนดชำระที่ค้างอยู่ในเดือนถัดไป'}
                            </p>
                          </div>
                          <p className="text-xs text-indigo-100 mt-4 border-t border-indigo-500/50 pt-2 font-medium">
                            สามารถโอนเงินคืนตามช่องทางของบ้านแล้วส่งสลิปด่วนด้านล่าง
                          </p>
                        </div>

                      </div>

                    {/* Member Active Section Container */}
                    <div className="mt-8">
                      {memberActiveTab === 'form' && (
                        <div className="max-w-2xl mx-auto">
                          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                              <Sparkles className="w-5 h-5 text-indigo-600" /> ทำรายการคำขอใหม่
                            </h3>

                            {/* Selector for Transaction Type */}
                            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200">
                              <button
                                type="button"
                                onClick={() => {
                                  setRequestType('pay_later');
                                  setProductName('');
                                  setProductPrice('');
                                }}
                                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                  requestType === 'pay_later'
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                                ผ่อนชำระสินค้า
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRequestType('cash_loan');
                                  setProductName('');
                                  setProductPrice('');
                                }}
                                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                  requestType === 'cash_loan'
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                <Landmark className="w-3.5 h-3.5 text-indigo-600" />
                                กู้ยืมเงินสด
                              </button>
                            </div>

                            {requestError && (
                              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
                                ⚠️ {requestError}
                              </div>
                            )}

                            <form onSubmit={handleRequestSubmit} className="space-y-4">
                              <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                                  {requestType === 'pay_later'
                                    ? 'ชื่อรายการสินค้า (Product Name)'
                                    : 'วัตถุประสงค์ในการกู้ยืมเงิน (Loan Purpose)'}
                                </label>
                                <input 
                                  type="text"
                                  required
                                  placeholder={
                                    requestType === 'pay_later'
                                      ? 'เช่น เสื้อยืด Uniqlo, หูฟังบลูทูธ'
                                      : 'เช่น ค่าเทอม, ค่ารักษาพยาบาล, สำรองจ่ายฉุกเฉิน'
                                  }
                                  value={productName}
                                  onChange={e => setProductName(e.target.value)}
                                  className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                />
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  {requestType === 'pay_later'
                                    ? 'ระบุชื่อสินค้าเพื่อช่วยให้แอดมินแยกแยะง่ายขึ้น'
                                    : 'ระบุเหตุผลหรือความจำเป็นในการขอกู้เงินสดครั้งนี้'}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                                    {requestType === 'pay_later'
                                      ? 'ราคาสินค้ารวม (บาท)'
                                      : 'จำนวนเงินที่ขอกู้ยืม (บาท)'}
                                  </label>
                                  <input 
                                    type="number"
                                    min={1}
                                    required
                                    placeholder={
                                      requestType === 'pay_later'
                                        ? 'ราคาจากแอพ'
                                        : 'ระบุจำนวนเงินสดที่ต้องการ'
                                    }
                                    value={productPrice}
                                    onChange={e => setProductPrice(e.target.value)}
                                    className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                                    {requestType === 'pay_later'
                                      ? 'จำนวนเดือนที่ต้องการผ่อน'
                                      : 'จำนวนงวดที่ต้องการผ่อนคืน'}
                                  </label>
                                  <select
                                    value={installmentTerm}
                                    onChange={e => setInstallmentTerm(parseInt(e.target.value))}
                                    className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                  >
                                    <option value={1}>ชำระเต็มจำนวน (1 งวด)</option>
                                    <option value={3}>3 เดือน</option>
                                    <option value={5}>5 เดือน</option>
                                    <option value={6}>6 เดือน</option>
                                    <option value={12}>12 เดือน</option>
                                  </select>
                                </div>
                              </div>

                              {/* Installment Calculation Section */}
                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                                <p className="text-xs font-bold text-slate-700">คำนวณยอดชำระเบื้องต้น</p>

                                {/* Live Installment Breakdown */}
                                <div className="border-t border-slate-200/80 pt-3 flex flex-col gap-1.5 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">
                                      {requestType === 'pay_later' ? 'ราคาสินค้าหลัก:' : 'จำนวนเงินกู้หลัก:'}
                                    </span>
                                    <span className="font-semibold text-slate-700">฿ {(parseFloat(productPrice) || 0).toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">ระยะเวลาผ่อนชำระ:</span>
                                    <span className="font-semibold text-slate-700">{installmentTerm} เดือน</span>
                                  </div>
                                  <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 mt-1 font-bold text-sm">
                                    <span className="text-slate-800">ยอดต้องชำระรายเดือน:</span>
                                    <span className="text-indigo-600">฿ {calc.monthly.toLocaleString()} / ด.</span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-medium flex items-center justify-between gap-1 mt-1">
                                    <span>📅 กำหนดชำระทุกวันที่ 1 ของเดือนถัดไป</span>
                                    <span className="text-slate-400">ดอกเบี้ย 0%</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="submit"
                                id="btn-request-submit"
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer"
                              >
                                <Check className="w-4 h-4" /> {requestType === 'pay_later' ? 'ส่งคำขอผ่อนชำระไปยังแอดมิน' : 'ส่งคำขอกู้ยืมเงินสดไปยังแอดมิน'}
                              </button>
                            </form>
                          </div>
                        </div>
                      )}

                      {memberActiveTab === 'schedule' && (
                        <div className="max-w-4xl mx-auto">
                          {/* Interactive Repayment Schedule */}
                          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3 flex-wrap gap-2">
                              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-1.5">
                                <Calendar className="w-5 h-5 text-indigo-600" /> ตารางผ่อนชำระและประวัติงวดของฉัน
                              </h3>
                              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                                  ยอดค้าง: ฿ {installments.filter(i => i.userId === currentUser.id && i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-3.5 max-h-[550px] overflow-y-auto pr-1">
                              {installments.filter(i => i.userId === currentUser.id).length === 0 ? (
                                <p className="text-center text-xs text-slate-400 py-6">คุณยังไม่มีตารางผ่อนชำระที่นี่ ลองสร้างคำขอในแบบฟอร์มเพื่อส่งให้แอดมินอนุมัติ</p>
                              ) : memberViewMode === 'grouped' ? (
                                (() => {
                                  const memberInsts = installments.filter(i => i.userId === currentUser.id);
                                  const grouped: { [key: string]: BillInstallment[] } = {};
                                  memberInsts.forEach(inst => {
                                    const monthKey = getYearMonthKey(inst.dueDate);
                                    if (!grouped[monthKey]) {
                                      grouped[monthKey] = [];
                                    }
                                    grouped[monthKey].push(inst);
                                  });
                                  const monthKeys = Object.keys(grouped).sort();

                                  return monthKeys.map(monthKey => {
                                    const instsInMonth = grouped[monthKey];
                                    const totalAmount = instsInMonth.reduce((sum, inst) => sum + inst.amount, 0);
                                    const unpaidInsts = instsInMonth.filter(inst => inst.status === 'unpaid');
                                    const unpaidSum = unpaidInsts.reduce((sum, inst) => sum + inst.amount, 0);
                                    const notifiedInsts = instsInMonth.filter(inst => inst.status === 'notified');
                                    
                                    // Determine overall status
                                    const isAllPaid = instsInMonth.every(inst => inst.status === 'paid');
                                    const isAllNotifiedOrPaid = instsInMonth.every(inst => inst.status === 'paid' || inst.status === 'notified');

                                    return (
                                      <div key={monthKey} className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-xs">
                                        {/* Month Header Banner */}
                                        <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center flex-wrap gap-2">
                                          <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-800 text-xs">📅 {getThaiMonthYearFromKey(monthKey)}</span>
                                            {isAllPaid ? (
                                              <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full">ชำระครบแล้ว</span>
                                            ) : isAllNotifiedOrPaid ? (
                                              <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full animate-pulse">รอกรรมการตรวจสอบ</span>
                                            ) : (
                                              <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded-full">รอชำระเงิน</span>
                                            )}
                                          </div>
                                          <div className="text-right text-[10px]">
                                            <span className="text-slate-400">ยอดงวดนี้รวม </span>
                                            <span className="font-bold text-slate-800">฿ {totalAmount.toLocaleString()}</span>
                                          </div>
                                        </div>

                                        {/* Month Items List */}
                                        <div className="divide-y divide-slate-100">
                                          {instsInMonth.map(inst => (
                                            <div key={inst.id} className="p-3 flex items-center justify-between text-xs bg-white/40 hover:bg-slate-50/20 transition">
                                              <div className="space-y-0.5">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                  {inst.requestType === 'cash_loan' ? (
                                                    <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[9px] px-1.5 py-0.2 rounded font-bold">
                                                      กู้เงิน
                                                    </span>
                                                  ) : (
                                                    <span className="inline-flex items-center gap-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] px-1.5 py-0.2 rounded font-bold">
                                                      ผ่อนสินค้า
                                                    </span>
                                                  )}
                                                  <span className="font-semibold text-slate-800">{inst.productName}</span>
                                                  <span className="text-[10px] text-slate-400 font-medium">(งวดที่ {inst.monthIndex})</span>
                                                  {inst.status === 'paid' && (
                                                    <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded">โอนแล้ว</span>
                                                  )}
                                                  {inst.status === 'notified' && (
                                                    <span className="text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded">รอตรวจ</span>
                                                  )}
                                                  {inst.status === 'unpaid' && (
                                                    <span className="text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.2 rounded">ค้างชำระ</span>
                                                  )}
                                                  {inst.reminded && inst.status === 'unpaid' && (
                                                    <span className="text-[9px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded animate-pulse flex items-center gap-0.5">
                                                      <Bell className="w-2.5 h-2.5 text-rose-600 animate-bounce" /> แอดมินขอให้ชำระด่วน!
                                                    </span>
                                                  )}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                                                  <span>กำหนดชำระ: {getThaiShortDate(inst.dueDate)}</span>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-2.5">
                                                <span className="font-bold text-slate-800">฿ {inst.amount.toLocaleString()}</span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>

                                        {/* Month Footer Action Area */}
                                        {!isAllNotifiedOrPaid && unpaidSum > 0 && (
                                          <div className="p-3 bg-indigo-50/30 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                                            <div className="text-left">
                                              <p className="text-[9px] text-slate-400 font-medium">ยอดคงเหลือค้างจ่ายรวมในเดือนนี้</p>
                                              <p className="text-xs font-extrabold text-indigo-900">฿ {unpaidSum.toLocaleString()}</p>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setNotifyingGroup({
                                                  dueDateKey: monthKey,
                                                  installments: unpaidInsts
                                                });
                                                setNotificationNotes('');
                                                setSlipPreviewUrl(null);
                                                setSlipImageName('');
                                              }}
                                              className="w-full sm:w-auto px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-1 cursor-pointer"
                                            >
                                              <Check className="w-3.5 h-3.5" /> ชำระยอดทั้งหมดของเดือนนี้ (฿ {unpaidSum.toLocaleString()})
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  });
                                })()
                              ) : (
                                installments.filter(i => i.userId === currentUser.id).map(inst => (
                                  <div key={inst.id} className="p-3.5 border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 rounded-xl transition flex flex-col md:flex-row md:items-center justify-between gap-3">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        {inst.requestType === 'cash_loan' ? (
                                          <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[9px] px-1.5 py-0.2 rounded font-bold">
                                            กู้เงิน
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] px-1.5 py-0.2 rounded font-bold">
                                            ผ่อนสินค้า
                                          </span>
                                        )}
                                        <span className="text-xs font-bold text-slate-800">{inst.productName}</span>
                                        <span className="text-[10px] text-slate-400">| งวดที่ {inst.monthIndex}</span>
                                        {inst.status === 'paid' && (
                                          <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">โอนเรียบร้อย</span>
                                        )}
                                        {inst.status === 'notified' && (
                                          <span className="text-[9px] bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-bold animate-pulse">ส่งแจ้งโอนแล้ว รอตรวจยอด</span>
                                        )}
                                        {inst.status === 'unpaid' && (
                                          <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded font-bold">ค้างจ่าย</span>
                                        )}
                                        {inst.reminded && inst.status === 'unpaid' && (
                                          <span className="text-[9px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded animate-pulse flex items-center gap-0.5">
                                            <Bell className="w-2.5 h-2.5 text-rose-600 animate-bounce" /> แอดมินขอให้ชำระด่วน!
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                        <span>📅 กำหนดชำระ: {getThaiShortDate(inst.dueDate)}</span>
                                      </p>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-3.5">
                                      <div className="text-left md:text-right">
                                        <p className="text-[10px] text-slate-400">ยอดงวดนี้</p>
                                        <p className="text-sm font-extrabold text-indigo-900">฿ {inst.amount.toLocaleString()}</p>
                                      </div>
                                      {inst.status === 'unpaid' && (
                                        <button 
                                          type="button"
                                          onClick={() => {
                                            setNotifyingBill(inst);
                                            setNotificationNotes('');
                                            setSlipPreviewUrl(null);
                                            setSlipImageName('');
                                          }}
                                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded shadow-sm transition cursor-pointer"
                                        >
                                          แจ้งโอนเงิน
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {memberActiveTab === 'history' && (
                        <div className="max-w-4xl mx-auto">
                          {/* Direct Submit Statuses history of Purchases */}
                          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                              <FileText className="w-5 h-5 text-indigo-600" /> ประวัติและสถานะคำสั่งซื้อ/เงินกู้ทั้งหมดของฉัน
                            </h3>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="border-b border-slate-200 text-slate-400">
                                    <th className="pb-2 font-semibold uppercase">ประเภท / รายละเอียด</th>
                                    <th className="pb-2 font-semibold uppercase">ราคารวม / ยอดกู้</th>
                                    <th className="pb-2 font-semibold uppercase">ระยะผ่อน</th>
                                    <th className="pb-2 font-semibold uppercase">สถานะคำขอ</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                  {requests.filter(r => r.userId === currentUser.id).length === 0 ? (
                                    <tr>
                                      <td colSpan={4} className="py-4 text-center text-slate-400 font-medium">คุณไม่มีประวัติการส่งคำซื้อ/คำขอกู้ยืม</td>
                                    </tr>
                                  ) : (
                                    requests.filter(r => r.userId === currentUser.id).map(r => (
                                      <tr key={r.id} className="hover:bg-slate-50/20">
                                        <td className="py-2.5">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            {r.requestType === 'cash_loan' ? (
                                              <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 border border-amber-100 text-[9px] px-1.5 py-0.5 rounded font-bold">
                                                <Landmark className="w-2.5 h-2.5" /> กู้ยืมเงินสด
                                              </span>
                                            ) : (
                                              <span className="inline-flex items-center gap-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] px-1.5 py-0.5 rounded font-bold">
                                                <Smartphone className="w-2.5 h-2.5" /> ผ่อนสินค้า
                                              </span>
                                            )}
                                            <span className="text-slate-800">{r.productName}</span>
                                          </div>
                                        </td>
                                        <td className="py-2.5 font-bold">฿ {r.totalPrice.toLocaleString()}</td>
                                        <td className="py-2.5 text-slate-500">{r.installments} งวด</td>
                                        <td className="py-2.5">
                                          {r.status === 'approved' && (
                                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">อนุมัติแล้ว</span>
                                          )}
                                          {r.status === 'pending' && (
                                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">รอพิจารณา</span>
                                          )}
                                          {r.status === 'rejected' && (
                                            <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[10px] font-bold">ไม่ผ่านการอนุมัติ</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                      </div>

                    {/* POPUP: NOTIFY PAYMENT DIALOG */}
                    {(notifyingBill || notifyingGroup) && (
                      <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                              <Bell className="w-5 h-5 text-indigo-600" /> แจ้งการชำระเงินแอดมิน
                            </h4>
                            <button 
                              onClick={() => {
                                setNotifyingBill(null);
                                setNotifyingGroup(null);
                              }} 
                              className="text-slate-400 hover:text-slate-600 font-bold"
                            >
                              ✕
                            </button>
                          </div>
                          
                          {notifyingBill && (
                            <div className="text-xs space-y-2 bg-slate-50 p-3 rounded-lg text-slate-600">
                              <p><span className="font-semibold text-slate-800">รายการ:</span> {notifyingBill.productName}</p>
                              <p><span className="font-semibold text-slate-800">งวดที่:</span> {notifyingBill.monthIndex}</p>
                              <p><span className="font-semibold text-slate-800">ยอดที่ต้องโอน:</span> ฿ {notifyingBill.amount.toLocaleString()}</p>
                            </div>
                          )}

                          {notifyingGroup && (
                            <div className="text-xs space-y-2 bg-slate-50 p-3 rounded-lg text-slate-600">
                              <p><span className="font-semibold text-slate-800">ยอดรวมประจำเดือน:</span> {getThaiMonthYearFromKey(notifyingGroup.dueDateKey)}</p>
                              <p className="font-semibold text-slate-800">รายละเอียดรายการ:</p>
                              <ul className="list-disc pl-4 space-y-1 text-slate-500 max-h-24 overflow-y-auto">
                                {notifyingGroup.installments.map(inst => (
                                  <li key={inst.id}>
                                    {inst.productName} (งวดที่ {inst.monthIndex}): <span className="font-bold text-slate-700">฿{inst.amount.toLocaleString()}</span>
                                  </li>
                                ))}
                              </ul>
                              <p className="border-t border-slate-200/60 pt-1.5 font-bold text-indigo-700 text-xs">
                                <span className="text-slate-700">ยอดรวมทั้งหมดที่ต้องโอน:</span> ฿ {notifyingGroup.installments.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
                              </p>
                            </div>
                          )}

                          {/* QR Code Payment Channel */}
                          <div className="bg-indigo-950 text-white rounded-xl p-4 text-center border border-indigo-900 space-y-3 shadow-md">
                            <div className="flex items-center justify-center gap-2">
                              <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/c/c5/PromptPay-logo.png" 
                                alt="PromptPay" 
                                className="h-5 object-contain bg-white px-1.5 py-0.5 rounded" 
                                referrerPolicy="no-referrer" 
                              />
                              <span className="text-[11px] bg-indigo-800 text-indigo-100 font-bold px-2 py-0.5 rounded border border-indigo-700">QR พร้อมเพย์</span>
                            </div>
                            
                            <div className="bg-white p-2.5 rounded-lg inline-block mx-auto border border-slate-200">
                              <svg className="w-28 h-28 text-indigo-950" viewBox="0 0 100 100" fill="currentColor">
                                <rect x="0" y="0" width="20" height="20" />
                                <rect x="2" y="2" width="16" height="16" fill="white" />
                                <rect x="5" y="5" width="10" height="10" />
                                
                                <rect x="80" y="0" width="20" height="20" />
                                <rect x="82" y="2" width="16" height="16" fill="white" />
                                <rect x="85" y="5" width="10" height="10" />
                                
                                <rect x="0" y="80" width="20" height="20" />
                                <rect x="2" y="82" width="16" height="16" fill="white" />
                                <rect x="5" y="85" width="10" height="10" />
                                
                                <rect x="25" y="5" width="5" height="5" />
                                <rect x="35" y="10" width="10" height="5" />
                                <rect x="50" y="0" width="5" height="15" />
                                <rect x="60" y="5" width="15" height="5" />
                                <rect x="25" y="25" width="10" height="10" />
                                <rect x="40" y="20" width="5" height="15" />
                                <rect x="55" y="30" width="15" height="5" />
                                <rect x="75" y="25" width="5" height="5" />
                                <rect x="85" y="35" width="10" height="5" />
                                <rect x="20" y="45" width="15" height="10" />
                                <rect x="40" y="50" width="20" height="5" />
                                <rect x="65" y="45" width="10" height="10" />
                                <rect x="80" y="50" width="15" height="5" />
                                <rect x="25" y="65" width="5" height="15" />
                                <rect x="35" y="75" width="15" height="5" />
                                <rect x="55" y="60" width="5" height="25" />
                                <rect x="65" y="70" width="10" height="5" />
                                <rect x="75" y="85" width="20" height="5" />
                                <rect x="85" y="70" width="5" height="10" />
                                <circle cx="50" cy="50" r="8" fill="indigo" />
                                <circle cx="50" cy="50" r="6" fill="white" />
                                <circle cx="50" cy="50" r="3" fill="indigo" />
                              </svg>
                            </div>
                            
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-slate-100">พร้อมเพย์แอดมิน: 081-234-5678</p>
                              <p className="text-[10px] text-sky-200">
                                สแกนเพื่อโอนเงินยอด ฿ {notifyingBill 
                                  ? notifyingBill.amount.toLocaleString() 
                                  : notifyingGroup ? notifyingGroup.installments.reduce((sum, i) => sum + i.amount, 0).toLocaleString() : '0'
                                } ด่วน
                              </p>
                            </div>
                          </div>

                          <form onSubmit={handleNotifyPayment} className="space-y-3">
                            <div className="space-y-2">
                              <label className="block text-xs font-semibold text-slate-600">
                                แนบรูปภาพสลิปโอนเงิน (ภาพถ่ายสลิป) <span className="text-red-500">*</span>
                              </label>
                              
                              <div className="flex flex-col gap-2">
                                <input 
                                  type="file"
                                  id="slip-upload-input"
                                  accept="image/*"
                                  onChange={handleFileChange}
                                  className="hidden"
                                />
                                
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => document.getElementById('slip-upload-input')?.click()}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-50 border border-dashed border-indigo-300 hover:bg-indigo-100/50 hover:border-indigo-400 text-indigo-700 text-xs font-bold rounded-xl transition cursor-pointer"
                                  >
                                    <FileText className="w-4 h-4" />
                                    {slipImageName ? 'เปลี่ยนภาพสลิป' : 'กดเลือกรูปภาพแนบสลิป'}
                                  </button>
                                  
                                  <button
                                    type="button"
                                    onClick={handleUseDemoSlip}
                                    className="px-3 py-2.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition flex items-center gap-1"
                                    title="จำลองสลิปธนาคารเพื่อทดลองระบบโดยไม่ต้องอัพโหลดจริง"
                                  >
                                    ⚡ สลิปจำลอง
                                  </button>
                                </div>

                                {slipPreviewUrl && (
                                  <div className="mt-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 relative flex flex-col items-center justify-center">
                                    <button 
                                      type="button"
                                      onClick={handleClearSlip}
                                      className="absolute top-1.5 right-1.5 w-5 h-5 bg-slate-900/80 hover:bg-slate-950 text-white rounded-full flex items-center justify-center text-[10px] transition"
                                      title="ลบสลิป"
                                    >
                                      ✕
                                    </button>
                                    <p className="text-[9px] text-slate-400 mb-1">{slipImageName || 'ภาพสลิปที่เลือก'}</p>
                                    <img 
                                      src={slipPreviewUrl} 
                                      alt="Slip Preview" 
                                      className="max-h-36 rounded shadow-sm border border-slate-100 object-contain"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setNotifyingBill(null);
                                  setNotifyingGroup(null);
                                }}
                                className="w-1/2 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition"
                              >
                                ยกเลิก
                              </button>
                              <button
                                type="submit"
                                disabled={!slipPreviewUrl}
                                className={`w-1/2 py-2.5 text-white rounded-lg text-xs font-bold transition shadow-sm ${
                                  slipPreviewUrl 
                                    ? 'bg-indigo-600 hover:bg-indigo-700' 
                                    : 'bg-indigo-300 cursor-not-allowed opacity-75'
                                }`}
                                title={!slipPreviewUrl ? 'กรุณาเลือกรูปภาพสลิปเพื่อส่งแจ้งโอน' : ''}
                              >
                                ส่งแจ้งโอนเงิน
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* ========================================================= */}
            {/* TAB: REQUESTS - ADMIN ONLY                                */}
            {/* ========================================================= */}
            {activeTab === 'requests' && currentUser.role === 'admin' && (() => {
              const filteredRequests = requests.filter(req => {
                const query = searchRequests.toLowerCase().trim();
                if (!query) return true;
                return (
                  req.userName.toLowerCase().includes(query) ||
                  req.productName.toLowerCase().includes(query) ||
                  (req.requestType === 'cash_loan' ? 'กู้ยืมเงินสด' : 'ผ่อนชำระสินค้า').includes(query) ||
                  req.status.toLowerCase().includes(query) ||
                  (req.status === 'pending' ? 'รอพิจารณา' : req.status === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว').includes(query)
                );
              });

              return (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <FileText className="w-5 h-5 text-indigo-600" /> รายการขออนุมัติการสั่งซื้อทั้งหมด
                  </h3>

                  {/* Search Input */}
                  <div className="mb-4 relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="h-4 w-4 text-slate-400" />
                    </span>
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อผู้สั่งซื้อ, ชื่อสินค้า, ประเภทคำขอ หรือสถานะ..."
                      value={searchRequests}
                      onChange={(e) => setSearchRequests(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                    {searchRequests && (
                      <button
                        onClick={() => setSearchRequests('')}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ล้างค่า
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr className="text-slate-500">
                          <th className="p-4 font-semibold">ผู้สั่งซื้อ</th>
                          <th className="p-4 font-semibold">ประเภท / รายละเอียดคำขอ</th>
                          <th className="p-4 font-semibold text-right">ยอดรวมสินค้า / เงินกู้</th>
                          <th className="p-4 font-semibold">แผนการผ่อนชำระ</th>
                          <th className="p-4 font-semibold text-center">สถานะ</th>
                          <th className="p-4 font-semibold text-center">การดำเนินการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {filteredRequests.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                              {searchRequests ? 'ไม่พบรายการที่ตรงกับการค้นหา' : 'ไม่มีรายการคำขอสั่งซื้อใด ๆ ในฐานข้อมูล'}
                            </td>
                          </tr>
                        ) : (
                          filteredRequests.map(req => (
                            <tr key={req.id} className="hover:bg-slate-50/30 transition">
                              <td className="p-4">
                                <p className="font-bold text-slate-800">{req.userName}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">ขอเมื่อ: {req.requestDate}</p>
                              </td>
                              <td className="p-4 text-slate-700 font-semibold">
                                <div className="flex flex-col gap-1">
                                  {req.requestType === 'cash_loan' ? (
                                    <span className="inline-flex items-center gap-1 w-max bg-amber-50 text-amber-700 border border-amber-200 text-[10px] px-2 py-0.5 rounded-md font-bold">
                                      <Landmark className="w-3 h-3" /> กู้ยืมเงินสด
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 w-max bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] px-2 py-0.5 rounded-md font-bold">
                                      <Smartphone className="w-3 h-3" /> ผ่อนชำระสินค้า
                                    </span>
                                  )}
                                  <span className="text-slate-800 text-sm">{req.productName}</span>
                                </div>
                              </td>
                              <td className="p-4 text-right font-extrabold text-slate-900">฿ {req.totalPrice.toLocaleString()}</td>
                              <td className="p-4">
                                <p className="text-xs font-semibold text-indigo-700">฿ {req.monthlyAmount.toLocaleString()} / ด.</p>
                                <p className="text-[10px] text-slate-500">รวมทั้งหมด {req.installments} เดือน</p>
                              </td>
                              <td className="p-4 text-center">
                                {req.status === 'approved' && (
                                  <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold">อนุมัติแล้ว</span>
                                )}
                                {req.status === 'pending' && (
                                  <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-bold animate-pulse">รอพิจารณา</span>
                                )}
                                {req.status === 'rejected' && (
                                  <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full text-xs font-bold">ปฏิเสธแล้ว</span>
                                )}
                              </td>
                              <td className="p-4 text-center">
                                {req.status === 'pending' ? (
                                  <div className="flex justify-center gap-1.5">
                                    <button 
                                      onClick={() => handleApproveRequest(req)}
                                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                                    >
                                      อนุมัติผ่านวงเงิน
                                    </button>
                                    <button 
                                      onClick={() => handleRejectRequest(req.id)}
                                      className="px-2.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg shadow-sm transition"
                                    >
                                      ปฏิเสธคำขอ
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400 font-normal">จัดการเรียบร้อยแล้ว</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* ========================================================= */}
            {/* TAB: MEMBERS - ADMIN ONLY                                 */}
            {/* ========================================================= */}
            {activeTab === 'members' && currentUser.role === 'admin' && (
              <div className="space-y-6">
                
                {/* Add Member Quick Form */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Plus className="w-5 h-5 text-indigo-600" /> เพิ่มสมาชิกผู้ใช้ครอบครัวคนใหม่
                  </h3>
                  <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">ชื่อเรียก / นามแฝง</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="เช่น น้องนนท์"
                        value={newMemberName}
                        onChange={e => setNewMemberName(e.target.value)}
                        className="w-full text-sm p-2.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">รหัส PIN 4 หลัก (เพื่อ Login)</label>
                      <input 
                        type="password" 
                        maxLength={4}
                        pattern="\d{4}"
                        required 
                        placeholder="รหัสผ่านเข้าใช้"
                        value={newMemberPin}
                        onChange={e => setNewMemberPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-sm p-2.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">วงเงินเริ่มต้น (บาท)</label>
                      <input 
                        type="number" 
                        min={1}
                        required 
                        value={newMemberLimit}
                        onChange={e => setNewMemberLimit(parseInt(e.target.value) || 0)}
                        className="w-full text-sm p-2.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm transition shadow-sm"
                    >
                      ลงทะเบียนและอนุญาตวงเงิน
                    </button>
                  </form>
                </div>

                {/* Edit Limits Ledger table */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Users className="w-5 h-5 text-indigo-600" /> จัดการและปรับแก้เครดิตวงเงิน
                  </h3>

                  {/* Search Input */}
                  <div className="mb-4 relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="h-4 w-4 text-slate-400" />
                    </span>
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อสมาชิก หรือ PIN เข้าใช้..."
                      value={searchMembers}
                      onChange={(e) => setSearchMembers(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                    {searchMembers && (
                      <button
                        type="button"
                        onClick={() => setSearchMembers('')}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ล้างค่า
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr className="text-slate-500">
                          <th className="p-4 font-semibold">สมาชิก</th>
                          <th className="p-4 font-semibold">วงเงินที่ได้รับสูงสุด</th>
                          <th className="p-4 font-semibold">ยอดใช้ผ่อนค้างชำระในระบบ</th>
                          <th className="p-4 font-semibold">วงเงินคงเหลือว่าง</th>
                          <th className="p-4 font-semibold text-center">ปรับเปลี่ยนค่าวงเงิน</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {(() => {
                          const filteredMembers = profiles
                            .filter(p => p.role === 'member')
                            .filter(member => {
                              const query = searchMembers.toLowerCase().trim();
                              if (!query) return true;
                              return (
                                member.name.toLowerCase().includes(query) ||
                                member.pin.includes(query) ||
                                member.id.toLowerCase().includes(query)
                              );
                            });

                          if (filteredMembers.length === 0) {
                            return (
                              <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                                  {searchMembers ? 'ไม่พบสมาชิกที่ตรงกับการค้นหา' : 'ไม่มีสมาชิกในระบบขณะนี้'}
                                </td>
                              </tr>
                            );
                          }

                          return filteredMembers.map(member => (
                            <tr key={member.id} className="hover:bg-slate-50/20 transition">
                              <td className="p-4">
                                <p className="font-bold text-slate-800">{member.name}</p>
                                <p className="text-xs text-slate-400">PIN ล็อกอินของเครื่อง: {member.pin}</p>
                              </td>
                              <td className="p-4 text-slate-800 font-semibold">฿ {member.creditLimit.toLocaleString()}</td>
                              <td className="p-4 text-rose-600 font-semibold">฿ {member.spentAmount.toLocaleString()}</td>
                              <td className="p-4 text-emerald-600 font-bold">฿ {(member.creditLimit - member.spentAmount).toLocaleString()}</td>
                              <td className="p-4 text-center">
                                {selectedMemberId === member.id ? (
                                  <div className="flex flex-col items-center gap-3 p-2 bg-indigo-50/50 border border-indigo-100 rounded-xl max-w-sm mx-auto">
                                    <div className="grid grid-cols-2 gap-2 w-full">
                                      <div className="flex flex-col gap-1 text-left">
                                        <label className="text-[10px] text-slate-500 font-bold">วงเงินสูงสุด (฿)</label>
                                        <input 
                                          type="number" 
                                          placeholder="เช่น 15000"
                                          value={customCreditLimitInput}
                                          onChange={e => setCustomCreditLimitInput(e.target.value)}
                                          className="w-full text-xs p-1.5 border border-slate-300 rounded text-center bg-white font-bold text-indigo-700 focus:outline-none focus:border-indigo-500"
                                        />
                                        {/* Presets for limit */}
                                        <div className="flex gap-0.5 justify-center mt-1 flex-wrap">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const cur = parseFloat(customCreditLimitInput) || 0;
                                              setCustomCreditLimitInput((cur + 5000).toString());
                                            }}
                                            className="px-1 py-0.5 bg-indigo-100/70 hover:bg-indigo-100 text-indigo-700 text-[9px] font-extrabold rounded cursor-pointer"
                                          >
                                            +5k
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const cur = parseFloat(customCreditLimitInput) || 0;
                                              setCustomCreditLimitInput(Math.max(0, cur - 5000).toString());
                                            }}
                                            className="px-1 py-0.5 bg-rose-100/70 hover:bg-rose-100 text-rose-700 text-[9px] font-extrabold rounded cursor-pointer"
                                          >
                                            -5k
                                          </button>
                                        </div>
                                      </div>

                                      <div className="flex flex-col gap-1 text-left">
                                        <label className="text-[10px] text-slate-500 font-bold">ยอดผ่อนค้างชำระ (฿)</label>
                                        <input 
                                          type="number" 
                                          placeholder="เช่น 0"
                                          value={customSpentAmountInput}
                                          onChange={e => setCustomSpentAmountInput(e.target.value)}
                                          className="w-full text-xs p-1.5 border border-slate-300 rounded text-center bg-white font-bold text-rose-700 focus:outline-none focus:border-rose-500"
                                        />
                                        {/* Presets for spent amount */}
                                        <div className="flex gap-0.5 justify-center mt-1 flex-wrap">
                                          <button
                                            type="button"
                                            onClick={() => setCustomSpentAmountInput('0')}
                                            className="px-1 py-0.5 bg-emerald-100/70 hover:bg-emerald-200 text-emerald-800 text-[9px] font-extrabold rounded cursor-pointer"
                                          >
                                            เคลียร์ 0
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const cur = parseFloat(customSpentAmountInput) || 0;
                                              setCustomSpentAmountInput((cur + 1000).toString());
                                            }}
                                            className="px-1 py-0.5 bg-rose-100/70 hover:bg-rose-100 text-rose-700 text-[9px] font-extrabold rounded cursor-pointer"
                                          >
                                            +1k
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex gap-2 w-full justify-end border-t border-indigo-100/60 pt-2">
                                      <button 
                                        onClick={() => handleUpdateLimitAndSpent(
                                          member.id, 
                                          parseFloat(customCreditLimitInput) || 0, 
                                          parseFloat(customSpentAmountInput) || 0
                                        )}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-xs font-bold transition shadow-sm cursor-pointer"
                                      >
                                        บันทึก
                                      </button>
                                      <button 
                                        onClick={() => setSelectedMemberId(null)}
                                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1 rounded text-xs font-semibold transition cursor-pointer"
                                      >
                                        ยกเลิก
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                                    <button 
                                      onClick={() => {
                                        setSelectedMemberId(member.id);
                                        setCustomCreditLimitInput(member.creditLimit.toString());
                                        setCustomSpentAmountInput(member.spentAmount.toString());
                                      }}
                                      className="text-xs text-indigo-600 hover:text-indigo-700 font-bold underline cursor-pointer"
                                    >
                                      แก้ไขวงเงิน/ยอดค้าง
                                    </button>
                                    <span className="text-slate-300 hidden sm:inline">|</span>
                                    {deletingMemberId === member.id ? (
                                      <div className="flex items-center gap-1 animate-pulse">
                                        <button
                                          onClick={() => handleDeleteMember(member.id)}
                                          className="text-[11px] text-white bg-rose-600 hover:bg-rose-700 px-2 py-0.5 rounded font-bold cursor-pointer"
                                        >
                                          ยืนยันลบ
                                        </button>
                                        <button
                                          onClick={() => setDeletingMemberId(null)}
                                          className="text-[11px] text-slate-500 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded font-semibold cursor-pointer"
                                        >
                                          ยกเลิก
                                        </button>
                                      </div>
                                    ) : (
                                      <button 
                                        onClick={() => setDeletingMemberId(member.id)}
                                        className="text-xs text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer"
                                      >
                                        ลบสมาชิก
                                      </button>
                                    )}
                                  </div>
                                )}
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB: MEMBER TRANSACTIONS HISTORY (ADMIN ONLY)             */}
            {/* ========================================================= */}
            {activeTab === 'transactions' && currentUser.role === 'admin' && (() => {
              const members = profiles.filter(p => p.role === 'member');
              const activeSelectedId = transactionSelectedMemberId || (members[0]?.id || '');
              const selectedProfile = profiles.find(p => p.id === activeSelectedId);
              
              const memberRequests = requests.filter(r => r.userId === activeSelectedId);
              const memberInstallments = installments.filter(i => i.userId === activeSelectedId);

              // Outstanding bills (unpaid & notified)
              const outstandingAmount = memberInstallments
                .filter(i => i.status !== 'paid')
                .reduce((sum, i) => sum + i.amount, 0);

              // Completed payments (paid)
              const paidAmount = memberInstallments
                .filter(i => i.status === 'paid')
                .reduce((sum, i) => sum + i.amount, 0);

              return (
                <div className="space-y-6">
                  {/* Part 1: Member Selection Bar */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in">
                    <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-600" /> เลือกสมาชิกเพื่อเรียกดูรายงานและประวัติธุรกรรม
                    </h2>
                    
                    {/* Search Input */}
                    <div className="mb-4 relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                      </span>
                      <input
                        type="text"
                        placeholder="ค้นหาชื่อสมาชิก..."
                        value={searchTxMembers}
                        onChange={(e) => setSearchTxMembers(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                      />
                      {searchTxMembers && (
                        <button
                          type="button"
                          onClick={() => setSearchTxMembers('')}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 text-[10px]"
                        >
                          ล้างค่า
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {(() => {
                        const filteredTxMembers = members.filter(member => {
                          const query = searchTxMembers.toLowerCase().trim();
                          if (!query) return true;
                          return member.name.toLowerCase().includes(query) || member.id.toLowerCase().includes(query);
                        });

                        if (filteredTxMembers.length === 0) {
                          return (
                            <p className="text-xs text-slate-500 col-span-full py-4 text-center">
                              {searchTxMembers ? 'ไม่พบรายชื่อสมาชิกที่ตรงกับการค้นหา' : 'ไม่มีสมาชิกในระบบขณะนี้'}
                            </p>
                          );
                        }

                        return filteredTxMembers.map(member => {
                          const isSelected = member.id === activeSelectedId;
                          const outstanding = installments
                            .filter(i => i.userId === member.id && i.status !== 'paid')
                            .reduce((sum, i) => sum + i.amount, 0);

                          return (
                            <button
                              key={member.id}
                              type="button"
                              onClick={() => setTransactionSelectedMemberId(member.id)}
                              className={`flex flex-col text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200/50 shadow-xs'
                                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                              }`}
                            >
                              <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-indigo-600 animate-pulse' : 'bg-sky-500'}`}></span>
                                {member.name}
                              </span>
                              <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                                <div className="flex justify-between">
                                  <span>วงเงินคงเหลือ:</span>
                                  <span className="font-bold text-emerald-600">฿{(member.creditLimit - member.spentAmount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>ยอดค้างชำระ:</span>
                                  <span className={`font-bold ${outstanding > 0 ? 'text-rose-600' : 'text-slate-500'}`}>฿{outstanding.toLocaleString()}</span>
                                </div>
                              </div>
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {selectedProfile ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Left side: Overview card + Quick Stats */}
                      <div className="space-y-6 lg:col-span-1">
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                              {selectedProfile.name.slice(0, 2)}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-800 text-base">{selectedProfile.name}</h3>
                              <p className="text-xs text-slate-400">ID: {selectedProfile.id}</p>
                            </div>
                          </div>

                          <div className="space-y-3.5 text-xs">
                            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">ข้อมูลสรุปสถานะเครดิต</p>
                            
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                              <span className="text-slate-600">วงเงินเครดิตที่อนุมัติ</span>
                              <span className="font-bold text-slate-800 text-sm">฿{selectedProfile.creditLimit.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                              <span className="text-slate-600">วงเงินคงเหลือปัจจุบัน</span>
                              <span className="font-bold text-emerald-600 text-sm">฿{(selectedProfile.creditLimit - selectedProfile.spentAmount).toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                              <span className="text-slate-600">ยอดที่เบิกใช้ไปสะสม</span>
                              <span className="font-bold text-slate-800 text-sm">฿{selectedProfile.spentAmount.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                              <span className="text-slate-600">ยอดรอผ่อนชำระปัจจุบัน</span>
                              <span className={`font-bold text-sm ${outstandingAmount > 0 ? 'text-rose-600' : 'text-slate-500'}`}>฿{outstandingAmount.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5">
                              <span className="text-slate-600">ยอดผ่อนเสร็จสิ้นแล้ว</span>
                              <span className="font-bold text-indigo-600 text-sm">฿{paidAmount.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Progress bar of limit usage */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-slate-500">อัตราการใช้งานวงเงิน</span>
                              <span className="text-slate-700">
                                {selectedProfile.creditLimit > 0 
                                  ? Math.round((selectedProfile.spentAmount / selectedProfile.creditLimit) * 100) 
                                  : 0}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                              <div 
                                className="h-full bg-indigo-600 transition-all duration-500"
                                style={{ width: `${selectedProfile.creditLimit > 0 ? Math.min(100, (selectedProfile.spentAmount / selectedProfile.creditLimit) * 100) : 0}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Quick Action Reminders summary */}
                        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
                          <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">การแจ้งเตือนสัญญาล่าสุด</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            แอดมินสามารถส่งการแจ้งเตือนค่าผ่อนรายงวดหรือดูภาพสลิปที่ส่งมาตรวจสอบได้ทันทีจากตารางด้านขวา
                          </p>
                          <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400">
                            <span>รายการคำขอ: {memberRequests.length} รายการ</span>
                            <span>บิลงวดทั้งหมด: {memberInstallments.length} งวด</span>
                          </div>
                        </div>
                      </div>

                      {/* Right side: Tabs or two sections for Requests & Installments */}
                      <div className="lg:col-span-2 space-y-6">
                        
                        {/* Section A: Purchase & Cash Loan Requests */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                              <FileText className="w-4.5 h-4.5 text-indigo-600" /> ประวัติคำขออนุมัติทั้งหมด ({memberRequests.length})
                            </h3>
                          </div>

                          {/* Search Input */}
                          <div className="mb-2 relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Search className="h-3.5 w-3.5 text-slate-400" />
                            </span>
                            <input
                              type="text"
                              placeholder="ค้นหาชื่อสินค้า, ประเภท (กู้เงินสด/ผ่อนสินค้า) หรือสถานะ..."
                              value={searchTxRequests}
                              onChange={(e) => setSearchTxRequests(e.target.value)}
                              className="w-full pl-9 pr-9 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                            />
                            {searchTxRequests && (
                              <button
                                type="button"
                                onClick={() => setSearchTxRequests('')}
                                className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400 hover:text-slate-600 text-[10px]"
                              >
                                ล้างค่า
                              </button>
                            )}
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  <th className="py-2.5">วันที่ขอ</th>
                                  <th className="py-2.5">รายการ</th>
                                  <th className="py-2.5">ประเภทคำขอ</th>
                                  <th className="py-2.5 text-right">ยอดรวม</th>
                                  <th className="py-2.5 text-center">งวด</th>
                                  <th className="py-2.5 text-center">สถานะ</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 text-xs text-slate-600">
                                {(() => {
                                  const filteredTxRequests = memberRequests.filter(req => {
                                    const query = searchTxRequests.toLowerCase().trim();
                                    if (!query) return true;
                                    return (
                                      req.productName.toLowerCase().includes(query) ||
                                      req.requestType.toLowerCase().includes(query) ||
                                      (req.requestType === 'cash_loan' && 'กู้เงินสด'.includes(query)) ||
                                      (req.requestType === 'purchase' && 'ผ่อนสินค้า'.includes(query)) ||
                                      req.status.toLowerCase().includes(query) ||
                                      (req.status === 'approved' && 'อนุมัติแล้ว'.includes(query)) ||
                                      (req.status === 'pending' && 'รอพิจารณา'.includes(query)) ||
                                      (req.status === 'rejected' && 'ปฏิเสธ'.includes(query))
                                    );
                                  });

                                  if (filteredTxRequests.length === 0) {
                                    return (
                                      <tr>
                                        <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                                          {searchTxRequests ? 'ไม่พบข้อมูลตามคำค้นหา' : 'ไม่พบประวัติการส่งคำขอผ่อนชำระ'}
                                        </td>
                                      </tr>
                                    );
                                  }

                                  return filteredTxRequests.map(req => (
                                    <tr key={req.id} className="hover:bg-slate-50/50">
                                      <td className="py-2.5 font-mono text-slate-500">
                                        {new Date(req.requestDate).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                                      </td>
                                      <td className="py-2.5 font-semibold text-slate-800">{req.productName}</td>
                                      <td className="py-2.5">
                                        {req.requestType === 'cash_loan' ? (
                                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200/50">
                                            <DollarSign className="w-2.5 h-2.5" /> กู้เงินสด
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-200/50">
                                            <Sparkles className="w-2.5 h-2.5" /> ผ่อนสินค้า
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-2.5 text-right font-bold text-slate-800">฿{req.totalPrice.toLocaleString()}</td>
                                      <td className="py-2.5 text-center font-semibold text-slate-500">{req.installments} ด.</td>
                                      <td className="py-2.5 text-center">
                                        {req.status === 'approved' && (
                                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200/50">อนุมัติแล้ว</span>
                                        )}
                                        {req.status === 'pending' && (
                                          <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200/50 animate-pulse">รอพิจารณา</span>
                                        )}
                                        {req.status === 'rejected' && (
                                          <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-rose-200/50">ปฏิเสธ</span>
                                        )}
                                      </td>
                                    </tr>
                                  ));
                                })()}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Section B: Dues and Monthly Installments */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                              <Calendar className="w-4.5 h-4.5 text-indigo-600" /> ตารางผ่อนชำระและประวัติรับเงิน ({memberInstallments.length})
                            </h3>
                          </div>

                          {/* Search Input */}
                          <div className="mb-2 relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Search className="h-3.5 w-3.5 text-slate-400" />
                            </span>
                            <input
                              type="text"
                              placeholder="ค้นหาชื่อสินค้า, งวด (เช่น งวด 1) หรือสถานะ..."
                              value={searchTxInstallments}
                              onChange={(e) => setSearchTxInstallments(e.target.value)}
                              className="w-full pl-9 pr-9 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                            />
                            {searchTxInstallments && (
                              <button
                                type="button"
                                onClick={() => setSearchTxInstallments('')}
                                className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400 hover:text-slate-600 text-[10px]"
                              >
                                ล้างค่า
                              </button>
                            )}
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  <th className="py-2.5">กำหนดจ่าย</th>
                                  <th className="py-2.5">รายการ</th>
                                  <th className="py-2.5 text-center">งวด</th>
                                  <th className="py-2.5 text-right">จำนวนเงิน</th>
                                  <th className="py-2.5 text-center">สถานะ</th>
                                  <th className="py-2.5 text-right">การจัดการ</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 text-xs text-slate-600">
                                {(() => {
                                  const filteredTxInstallments = memberInstallments.filter(inst => {
                                    const query = searchTxInstallments.toLowerCase().trim();
                                    if (!query) return true;
                                    return (
                                      inst.productName.toLowerCase().includes(query) ||
                                      `งวด ${inst.monthIndex}`.toLowerCase().includes(query) ||
                                      inst.status.toLowerCase().includes(query) ||
                                      (inst.status === 'paid' && 'จ่ายแล้ว'.includes(query)) ||
                                      (inst.status === 'notified' && 'ส่งสลิปแล้ว'.includes(query)) ||
                                      (inst.status === 'unpaid' && 'ยังไม่จ่าย'.includes(query))
                                    );
                                  });

                                  if (filteredTxInstallments.length === 0) {
                                    return (
                                      <tr>
                                        <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                                          {searchTxInstallments ? 'ไม่พบข้อมูลตามคำค้นหา' : 'ไม่พบตารางการผ่อนชำระงวดใดๆ ของสมาชิกคนนี้'}
                                        </td>
                                      </tr>
                                    );
                                  }

                                  return filteredTxInstallments.map(inst => {
                                    return (
                                      <tr key={inst.id} className="hover:bg-slate-50/50">
                                        <td className="py-2.5 font-mono text-slate-500">
                                          {new Date(inst.dueDate).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="py-2.5">
                                          <div>
                                            <p className="font-semibold text-slate-800">{inst.productName}</p>
                                            {inst.notificationNotes && (
                                              <p className="text-[10px] text-indigo-600/80 mt-0.5 italic">{inst.notificationNotes}</p>
                                            )}
                                          </div>
                                        </td>
                                        <td className="py-2.5 text-center font-bold text-slate-500">
                                          งวด {inst.monthIndex}
                                        </td>
                                        <td className="py-2.5 text-right font-extrabold text-slate-800">
                                          ฿{inst.amount.toLocaleString()}
                                        </td>
                                        <td className="py-2.5 text-center">
                                          {inst.status === 'paid' && (
                                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200/50">จ่ายแล้ว</span>
                                          )}
                                          {inst.status === 'notified' && (
                                            <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200/50 animate-pulse">ส่งสลิปแล้ว</span>
                                          )}
                                          {inst.status === 'unpaid' && (
                                            <span className="bg-slate-50 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">ยังไม่จ่าย</span>
                                          )}
                                        </td>
                                        <td className="py-2.5 text-right space-y-1">
                                          <div className="flex justify-end items-center gap-1.5 flex-wrap">
                                            {inst.slipImage && (
                                              <button
                                                type="button"
                                                onClick={() => setViewingAdminSlip(inst.slipImage || null)}
                                                className="text-[10px] font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 px-2 py-1 rounded cursor-pointer"
                                              >
                                                ดูสลิป
                                              </button>
                                            )}
                                            
                                            {inst.status !== 'paid' && (
                                              <button
                                                type="button"
                                                onClick={() => handleMarkAsPaid(inst)}
                                                className="text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 px-2.5 py-1 rounded shadow-xs flex items-center gap-0.5 cursor-pointer"
                                              >
                                                <Check className="w-3 h-3" /> จ่ายแล้ว
                                              </button>
                                            )}
                                            
                                            {inst.status === 'unpaid' && (
                                              <button
                                                type="button"
                                                onClick={() => handleRemindInstallment(inst.id)}
                                                className={`text-[10px] font-bold px-2 py-1 rounded border cursor-pointer ${
                                                  inst.reminded
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                                                }`}
                                              >
                                                {inst.reminded ? 'เตือนแล้ว' : 'ส่งแจ้งเตือน'}
                                              </button>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  });
                                })()}
                              </tbody>
                            </table>
                          </div>
                        </div>

                      </div>
                      
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
                      <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm font-semibold">กรุณาเลือกสมาชิกด้านบนเพื่อเรียกดูประวัติการทำรายการและงวดผ่อนชำระทั้งหมด</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ========================================================= */}
            {/* TAB: GUIDE - TECHNICAL DOCUMENTATION IN THAI             */}
            {/* ========================================================= */}
            {activeTab === 'guide' && (
              <div className="space-y-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                
                {/* Executive Summary */}
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-indigo-600" /> คู่มือโครงสร้างระบบและสถาปัตยกรรม "Family PayLater"
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    บทวิเคราะห์ทางเทคนิคสำหรับทางเลือกการพัฒนาระหว่าง No-Code (Glide Apps + Google Sheets) และ Custom Full-Stack (Next.js + Supabase) เพื่อใช้งานในครอบครัวอย่างคุ้มค่า
                  </p>
                </div>

                {/* Section 1: User Flow & Conceptualization */}
                <div className="space-y-3">
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs">1</span>
                    โฟลว์การทำงานของระบบ (User Flow & Concept)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                      <p className="font-bold text-indigo-600 uppercase tracking-wide">ฝั่งสมาชิกครอบครัว (Member View Flow)</p>
                      <ul className="list-decimal pl-4 space-y-1.5">
                        <li><span className="font-semibold text-slate-800">เข้าสู่ระบบ:</span> สมาชิกเลือกโปรไฟล์ของตนเองและกดรหัส PIN 4 หลัก ไม่ต้องระบุข้อมูลส่วนตัวที่มีความซับซ้อน</li>
                        <li><span className="font-semibold text-slate-800">ตรวจสอบเครดิต:</span> หน้าจอแรกจะแสดง "วงเงินชำระคงเหลือ" และตารางกำหนดผ่อนที่มีความชัดเจน</li>
                        <li><span className="font-semibold text-slate-800">ส่งคำขอผ่อนชำระ:</span> คีย์ชื่อสินค้าและราคาจากแอพส้มหรือแอพติ๊กต็อก พร้อมเลือกเดือนที่ต้องการผ่อน (เช่น 3, 6, 12 เดือน) โดยระบบจะคำนวณราคาเฉลี่ยต่อเดือนให้เรียบร้อย</li>
                        <li><span className="font-semibold text-slate-800">แจ้งการจ่ายคืน:</span> เมื่อเงินเดือนออก สมาชิกโอนเงินเข้าบัญชีแอดมิน จากนั้นคลิกปุ่ม "แจ้งโอนเงิน" เพื่อเขียนข้อความระบุวันที่และจำนวนเงินให้ทางแอดมินรับทราบ</li>
                      </ul>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                      <p className="font-bold text-indigo-600 uppercase tracking-wide">ฝั่งผู้ดูแลระบบ (Admin Flow - แอดมินเบียร์/มิน)</p>
                      <ul className="list-decimal pl-4 space-y-1.5">
                        <li><span className="font-semibold text-slate-800">จัดการข้อมูลและวงเงิน:</span> ตั้งค่าเครดิตให้สมาชิกแต่ละคนตามระดับความรับผิดชอบ (เช่น น้องบี 10,000 บาท, พี่เอ 20,000 บาท)</li>
                        <li><span className="font-semibold text-slate-800">พิจารณาคำขอสั่งซื้อ:</span> ตรวจสอบสินค้าที่สมาชิกร้องขอ หากพิจารณาว่าเหมาะสมและวงเงินคงเหลือพอ จะกดยืนยันเพื่อบันทึกรายการผ่อนชำระอัตโนมัติ</li>
                        <li><span className="font-semibold text-slate-800">ยืนยันยอดรับเงินโอน:</span> ตรวจสอบสลิปและข้อความแจ้งโอนของสมาชิกบนบอร์ดหลัก เมื่อตรงกับบัญชีจริง แอดมินกดยืนยันเพื่อคืนวงเงินและปลดหนี้ให้สมาชิก</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Section 2: Technology Stack Recommendation */}
                <div className="space-y-4">
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs">2</span>
                    การเปรียบเทียบสถาปัตยกรรมทางเทคโนโลยี (Stack Options)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Option A: No-Code/Low-Code */}
                    <div className="border border-indigo-200 bg-indigo-50/10 rounded-2xl p-5 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4 text-indigo-600" /> Option A (แนะนำ): Glide Apps + Google Sheets
                        </h4>
                        <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full uppercase">No-Code Best</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-800">ทำไมถึงเหมาะสมที่สุด?</span> เนื่องจากผู้ใช้เป็นสมาชิกภายในบ้าน มีจำนวนหลักสิบคน การใช้ Google Sheets เป็นระบบจัดเก็บข้อมูลจะทำให้ตรวจสอบและแก้ข้อมูลด้วยตนเองได้ผ่านตารางสเปรดชีตทั่วไป ส่วน Glide Apps จะทำหน้าที่แปลงข้อมูลเหล่านั้นมาจัดแสดงเป็น Mobile/Tablet UI ที่ใช้งานได้อย่างลื่นไหลและใช้เวลาขึ้นระบบเพียงไม่กี่ชั่วโมงโดยไม่ต้องเขียนโค้ดสักบรรทัดเดียว
                      </p>
                      <div className="text-xs text-slate-600">
                        <span className="font-bold text-slate-700">จุดเด่นสำคัญ:</span>
                        <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-500">
                          <li>ประหยัดค่าใช้จ่ายเริ่มต้นสูงมาก (ใช้ฟรีบนแพ็กเกจตั้งต้นได้สบาย)</li>
                          <li>แก้โครงสร้างตารางหลังบ้านง่าย ๆ แค่เปิด Google Sheets</li>
                          <li>แชร์ให้คนในครอบครัวใช้งานผ่าน QR Code ได้ทันที</li>
                        </ul>
                      </div>
                    </div>

                    {/* Option B: Custom Code */}
                    <div className="border border-slate-200 bg-white rounded-2xl p-5 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <Settings className="w-4 h-4 text-slate-500" /> Option B: Next.js + Tailwind + Supabase (PostgreSQL)
                        </h4>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full uppercase">Custom Code</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-800">ทำไมถึงเลือกทางนี้?</span> หากต้องการขยายขีดความสามารถ เช่น การแจ้งเตือนผ่าน Line Notify แบบเรียลไทม์ การจัดการคำนวณที่ยืดหยุ่นสูง หรือไม่มีข้อจำกัดเรื่องจำนวนแถวของ Glide Apps การใช้ Next.js กับฐานข้อมูลฟรีอย่าง Supabase จะให้การควบคุมที่ละเอียดอ่อน ปลอดภัย และมีระบบรักษาความปลอดภัย Row Level Security (RLS) ที่แข็งแรง
                      </p>
                      <div className="text-xs text-slate-600">
                        <span className="font-bold text-slate-700">จุดเด่นสำคัญ:</span>
                        <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-500">
                          <li>ปรับแต่งพฤติกรรม UI และการคำนวณเชิงลึกได้ไม่มีข้อจำกัด</li>
                          <li>ฐานข้อมูลขนาดใหญ่ที่รองรับรายการผ่อนชำระระยะยาว</li>
                          <li>เขียนระบบ Log หรือข้อความเตือนย้อนหลังที่ซับซ้อนได้</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Database Schema Design */}
                <div className="space-y-4">
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs">3</span>
                    การออกแบบโครงสร้างฐานข้อมูล (Database Schema Schema Design)
                  </h3>
                  <p className="text-xs text-slate-600">
                    ไม่ว่าจะเลือก Google Sheets หรือ PostgreSQL ตารางความสัมพันธ์ด้านล่างคือมาตรฐานขั้นต่ำที่จำเป็นต้องมี เพื่อให้ระบบสามารถจัดเก็บบิลและหนี้ค้างชำระได้อย่างถูกต้อง
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Table 1: Profiles */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <p className="font-bold text-indigo-700 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <User className="w-4 h-4" /> ตารางที่ 1: Users / Profiles
                      </p>
                      <p className="text-[10px] text-slate-500 mb-2">เก็บข้อมูลระบุตัวตน บทบาท และการจำกัดวงเงิน</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between border-b border-slate-200/50 py-1 font-mono">
                          <span className="font-bold">id</span>
                          <span className="text-slate-500">UUID / Text</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/50 py-1 font-mono">
                          <span className="font-bold">nickname</span>
                          <span className="text-slate-500">Text</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/50 py-1 font-mono">
                          <span className="font-bold">pin_code</span>
                          <span className="text-slate-500">Text (4-6 digits)</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/50 py-1 font-mono">
                          <span className="font-bold">role</span>
                          <span className="text-slate-500">"admin" | "member"</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/50 py-1 font-mono">
                          <span className="font-bold">credit_limit</span>
                          <span className="text-slate-500">Numeric (บาท)</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/50 py-1 font-mono">
                          <span className="font-bold">spent_amount</span>
                          <span className="text-slate-500">Numeric (บาท)</span>
                        </div>
                      </div>
                    </div>

                    {/* Table 2: PurchaseRequests */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <p className="font-bold text-indigo-700 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FileText className="w-4 h-4" /> ตารางที่ 2: Purchase_Requests
                      </p>
                      <p className="text-[10px] text-slate-500 mb-2">เก็บบันทึกประวัติรายการสินค้าที่ขอนุมัติซื้อ</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between border-b border-slate-200/50 py-1 font-mono">
                          <span className="font-bold">id</span>
                          <span className="text-slate-500">UUID / Text</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/50 py-1 font-mono">
                          <span className="font-bold">user_id</span>
                          <span className="text-slate-500">Foreign Key</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/50 py-1 font-mono">
                          <span className="font-bold">product_name</span>
                          <span className="text-slate-500">Text</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/50 py-1 font-mono">
                          <span className="font-bold">total_price</span>
                          <span className="text-slate-500">Numeric (รวมดอกเบี้ย)</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/50 py-1 font-mono">
                          <span className="font-bold">installments</span>
                          <span className="text-slate-500">Integer (จำนวนเดือน)</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/50 py-1 font-mono">
                          <span className="font-bold">status</span>
                          <span className="text-slate-500">"pending"|"approved"|"rejected"</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/50 py-1 font-mono">
                          <span className="font-bold">request_date</span>
                          <span className="text-slate-500">Date</span>
                        </div>
                      </div>
                    </div>

                    {/* Table 3: Installments */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <p className="font-bold text-indigo-700 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" /> ตารางที่ 3: Bill_Installments
                      </p>
                      <p className="text-[10px] text-slate-500 mb-2">เก็บงวดการจ่ายเงินย่อยรายเดือนของแต่ละรายการ</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between border-b border-slate-200/50 py-1 font-mono">
                          <span className="font-bold">id</span>
                          <span className="text-slate-500">UUID / Text</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/50 py-1 font-mono">
                          <span className="font-bold">request_id</span>
                          <span className="text-slate-500">Foreign Key</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/50 py-1 font-mono">
                          <span className="font-bold">month_index</span>
                          <span className="text-slate-500">Integer (งวดที่ 1, 2, ...)</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/50 py-1 font-mono">
                          <span className="font-bold">amount</span>
                          <span className="text-slate-500">Numeric (ยอดต่อเดือน)</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/50 py-1 font-mono">
                          <span className="font-bold">due_date</span>
                          <span className="text-slate-500">Date</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/50 py-1 font-mono">
                          <span className="font-bold">status</span>
                          <span className="text-slate-500">"unpaid"|"notified"|"paid"</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/50 py-1 font-mono">
                          <span className="font-bold">notified_notes</span>
                          <span className="text-slate-500">Text (ข้อความแนบสลิป)</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Section 4: Step-by-Step Implementation for Glide Apps */}
                <div className="space-y-4">
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs">4</span>
                    ขั้นตอนการสร้างด้วย Glide Apps & Google Sheets (No-Code Guide)
                  </h3>

                  <div className="space-y-3.5 text-xs text-slate-600">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <p className="font-bold text-indigo-700">ขั้นตอนที่ 1: การจำลองสูตรและเตรียม Google Sheets</p>
                      <p>สร้างชีตขึ้นมา 3 ชีตตามโครงสร้างชื่อตารางด้านบน และนำข้อมูลไปใส่เป็นหัวคอลัมน์แถวแรก</p>
                      <p className="font-semibold text-slate-800">💡 เคล็ดลับการคำนวณงวดแบบอัตโนมัติในฐานข้อมูล (Glide & Google Sheets):</p>
                      <p>เพื่อให้ Glide Apps คำนวณงวดผ่อนต่อเดือนอัตโนมัติ ให้ใช้ <span className="font-semibold bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded">"Math Column"</span> ในส่วนของ Data Editor ของ Glide โดยตรง:</p>
                      <div className="bg-white border border-slate-200 p-3 rounded-lg font-mono text-[11px] text-slate-700 space-y-1">
                        <p className="text-indigo-600 font-bold">// หากชำระคงที่ปราศจากดอกเบี้ย:</p>
                        <p>สูตรใน Glide: <span className="bg-slate-100 px-1 py-0.5 rounded font-bold">Total_Price / Installments</span></p>
                        <p className="text-amber-600 font-bold mt-2">// หากคำนวณดอกเบี้ยแบบ Simple Interest:</p>
                        <p>สูตรใน Glide: <span className="bg-slate-100 px-1 py-0.5 rounded font-bold">(Total_Price * (1 + (Interest_Rate / 100) * Installments)) / Installments</span></p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <p className="font-bold text-indigo-700">ขั้นตอนที่ 2: เชื่อมโยงและตั้งค่าแอปบน Glide</p>
                      <p>สมัครสมาชิกใน Glide แล้วเลือกสร้างแอปด้วย "Google Sheets" ตัว Glide จะนำเข้าคอลัมน์ของคุณโดยตรงเพื่อมาเป็นฐานข้อมูลของระบบทันที</p>
                      <p>ในหน้าดีไซน์เนอร์ ให้สร้าง <span className="font-semibold">"Form Component"</span> ในหน้ารายการสินค้า เพื่ออนุญาตให้สมาชิกล็อคอินด้วย PIN และคีย์ข้อมูลชื่อและราคาเข้าสู่ระบบหลังบ้านเพื่ออนุมัติ</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <p className="font-bold text-indigo-700">ขั้นตอนที่ 3: ออกแบบหน้าจอควบคุม (UI Customization)</p>
                      <p>สร้างหน้าจอ Admin แยกรวมกับหน้าจอของสมาชิกทั่วไป โดยการซ่อน/แสดงแท็บตาม "Role" ของโปรไฟล์ผู้เข้าสู่ระบบ</p>
                      <p>แอดมินจะสามารถเห็นปุ่มดำเนินการเพื่ออนุมัติคำขอ และเปลี่ยนค่าสถานะ (Status) ในชีตบิลเป็นจ่ายแล้วได้โดยตรง</p>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </main>
        </div>
      )}
      {/* POPUP: VIEW SLIP DETAIL (FOR ADMIN) */}
      {viewingAdminSlip && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setViewingAdminSlip(null)}>
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full relative border border-slate-200 shadow-2xl space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> หลักฐานสลิปการโอนเงิน
              </span>
              <button onClick={() => setViewingAdminSlip(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
            </div>
            <div className="flex justify-center bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              <img src={viewingAdminSlip} alt="Full Slip" className="max-h-[70vh] rounded-lg shadow-sm object-contain" referrerPolicy="no-referrer" />
            </div>
            <button 
              onClick={() => setViewingAdminSlip(null)} 
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition"
            >
              ปิดหน้าต่างหลักฐาน
            </button>
          </div>
        </div>
      )}
      {/* POPUP: CONFIRM LOGOUT */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setShowLogoutConfirm(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full relative border border-slate-100 shadow-2xl space-y-4 text-center" onClick={e => e.stopPropagation()}>
            <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center border border-rose-100 shadow-inner">
              <LogOut className="w-8 h-8" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-slate-800 text-lg">
                ยืนยันการออกจากระบบ?
              </h3>
              <p className="text-sm text-slate-500">
                คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบบัญชีปัจจุบันนี้
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={performLogout}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-md shadow-rose-600/20 hover:shadow-lg hover:shadow-rose-600/30 transition cursor-pointer"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
