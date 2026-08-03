import { useState, useEffect, useRef } from 'react';
import { initialTrips } from './data/trips';
import { ref, onValue, set, get } from 'firebase/database';
import { rtdb } from './firebase';
import { 
  Compass, 
  Plus, 
  Calendar, 
  Users, 
  DollarSign, 
  FileText, 
  Folder, 
  FolderOpen, 
  CalendarDays,
  PieChart, 
  RefreshCw, 
  Download, 
  Search, 
  SlidersHorizontal,
  X, 
  Check, 
  User,
  CreditCard,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Edit2,
  Ticket,
  Copy,
  Sun,
  Moon,
  Eye,
  Receipt,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calculator,
  Info
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import './App.css';

function App() {
  // Load trips from localStorage or use initialTrips
  const [trips, setTrips] = useState(() => {
    const saved = localStorage.getItem('monitoring_trips_v9');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validate data has actual expenses (not wiped by failed cloud sync)
        if (parsed && parsed[0] && parsed[0].expenses && parsed[0].expenses.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse trips", e);
      }
    }
    return initialTrips;
  });

  const [copiedId, setCopiedId] = useState(null);
  const [previewTicket, setPreviewTicket] = useState(null);
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState(null);
  const [showCalcDetail, setShowCalcDetail] = useState(false);
  const [editingAccountParticipant, setEditingAccountParticipant] = useState(null);
  const [tempBankName, setTempBankName] = useState('');
  const [tempAccountNumber, setTempAccountNumber] = useState('');
  const [tempAccountName, setTempAccountName] = useState('');

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadedFromCloud, setIsLoadedFromCloud] = useState(false);
  const isRemoteUpdate = useRef(false);

  // Real-time Firebase Realtime Database listener
  useEffect(() => {
    const rtdbRef = ref(rtdb, 'trips/italy-2026');

    const unsubscribe = onValue(rtdbRef, (snapshot) => {
      const val = snapshot.val();
      if (val && Array.isArray(val) && val.length > 0) {
        isRemoteUpdate.current = true;
        setTrips(val);
      } else if (!snapshot.exists()) {
        // First time: seed the database with initial trips data
        set(rtdbRef, initialTrips).catch(() => {});
      }
      setIsLoadedFromCloud(true);
    }, (err) => {
      console.error('RTDB onValue error:', err);
      setIsLoadedFromCloud(true);
    });

    return () => unsubscribe();
  }, []);

  const handleSyncCloud = async () => {
    setIsRefreshing(true);
    try {
      const rtdbRef = ref(rtdb, 'trips/italy-2026');
      const snap = await get(rtdbRef);
      if (snap.exists()) {
        const val = snap.val();
        if (val && Array.isArray(val) && val.length > 0) {
          isRemoteUpdate.current = true;
          setTrips(val);
        }
      }
    } catch (err) {
      console.error('Manual RTDB sync error:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  // Save trips to localStorage & Firebase Realtime Database
  useEffect(() => {
    if (!isLoadedFromCloud) return;

    localStorage.setItem('monitoring_trips_v9', JSON.stringify(trips));

    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    const rtdbRef = ref(rtdb, 'trips/italy-2026');
    set(rtdbRef, trips).catch((err) => console.error('RTDB write error:', err));
  }, [trips, isLoadedFromCloud]);

  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'light');

  useEffect(() => {
    document.body.classList.toggle('light-theme', theme === 'light');
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const [selectedTripId, setSelectedTripId] = useState(() => {
    return trips.length > 0 ? trips[0].id : null;
  });
  
  // Default tab to 'dashboard' as requested by the user
  const [currentTab, setCurrentTab] = useState('dashboard'); // 'dashboard' | 'expenses' | 'tickets' | 'map' | 'split'
  const [selectedFolder, setSelectedFolder] = useState('All'); // 'All' | participantNames
  const [selectedMapNode, setSelectedMapNode] = useState(0); // Index of map nodes
  
  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isAddTicketModalOpen, setIsAddTicketModalOpen] = useState(false);

  // Add Ticket states
  const [newTicketName, setNewTicketName] = useState('');
  const [newTicketFile, setNewTicketFile] = useState('');
  const [newTicketFileName, setNewTicketFileName] = useState('');
  const [newTicketPassengers, setNewTicketPassengers] = useState([]);

  // Filters for Expense List
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('All');
  const [expensePayerFilter, setExpensePayerFilter] = useState('All');
  const [selectedDateTab, setSelectedDateTab] = useState('All');

  const formatDateLabel = (dateStr) => {
    if (dateStr === '2026-07-31') return 'Pre-Trip';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const day = parseInt(parts[2], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      return `${day} ${monthNames[monthIndex]}`;
    }
    return dateStr;
  };

  // Participant involvement states
  const [newExpInvolved, setNewExpInvolved] = useState([]);
  const [editExpInvolved, setEditExpInvolved] = useState([]);

  // Form states for New Expense
  const [newExpActivity, setNewExpActivity] = useState('');
  const [newExpCategory, setNewExpCategory] = useState('Transportation');
  const [newExpBudget, setNewExpBudget] = useState('');
  const [newExpActual, setNewExpActual] = useState('');
  const [newExpPaidBy, setNewExpPaidBy] = useState('Thitiwut');
  const [newExpDate, setNewExpDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newExpHasTicket, setNewExpHasTicket] = useState(false);
  const [newExpReceipt, setNewExpReceipt] = useState('');

  // Form states for Editing Expense
  const [editExpId, setEditExpId] = useState(null);
  const [editExpActivity, setEditExpActivity] = useState('');
  const [editExpCategory, setEditExpCategory] = useState('Transportation');
  const [editExpBudget, setEditExpBudget] = useState('');
  const [editExpActual, setEditExpActual] = useState('');
  const [editExpPaidBy, setEditExpPaidBy] = useState('');
  const [editExpDate, setEditExpDate] = useState('');
  const [editExpStatus, setEditExpStatus] = useState('paid');
  const [editExpHasTicket, setEditExpHasTicket] = useState(false);
  const [editExpReceipt, setEditExpReceipt] = useState('');

  const handleReceiptFileUpload = (file, callback) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit");
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      callback(evt.target.result);
    };
    reader.readAsDataURL(file);
  };

  const openAddTicketModal = () => {
    setNewTicketName('');
    setNewTicketFile('');
    setNewTicketFileName('');
    setNewTicketPassengers(participantsList);
    setIsAddTicketModalOpen(true);
  };

  const handleTicketSelectFile = (file) => {
    if (!file) return;
    setNewTicketFileName(file.name);
    if (!newTicketName) {
      setNewTicketName(file.name);
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      setNewTicketFile(evt.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddTicketSubmit = (e) => {
    e.preventDefault();
    if (!newTicketName || !newTicketFile) {
      alert("Please select a ticket file");
      return;
    }

    const newTicketObj = {
      name: newTicketName,
      file: newTicketFile,
      passengers: newTicketPassengers.length > 0 ? newTicketPassengers : participantsList
    };

    setTrips(prev => prev.map(t => {
      if (t.id === selectedTripId) {
        return {
          ...t,
          tickets: [newTicketObj, ...(t.tickets || [])]
        };
      }
      return t;
    }));

    setIsAddTicketModalOpen(false);
  };

  const handleDeleteTicket = (ticketToDelete) => {
    if (window.confirm(`Are you sure you want to delete "${ticketToDelete.name}"?`)) {
      setTrips(prev => prev.map(t => {
        if (t.id === selectedTripId) {
          return {
            ...t,
            tickets: (t.tickets || []).filter(item => item !== ticketToDelete && item.file !== ticketToDelete.file)
          };
        }
        return t;
      }));
    }
  };

  // Form states for New Trip
  const [newTripName, setNewTripName] = useState('');
  const [newTripParticipants, setNewTripParticipants] = useState('');

  // Active Trip reference
  const activeTrip = trips.find(t => t.id === selectedTripId) || (trips.length > 0 ? trips[0] : null);

  if (!activeTrip) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <h1 className="trip-main-title">No Trips Registered</h1>
        <button className="btn-action btn-action-primary" style={{ margin: '2rem auto' }} onClick={() => setIsTripModalOpen(true)}>
          <Plus size={18} /> Register First Trip
        </button>
      </div>
    );
  }

  // Categories list
  const categories = ["Transportation", "Accomodation", "Food", "Activities", "Souvenirs", "Flight ticket"];

  // Colors for Category visualization
  const categoryColors = {
    "Transportation": "#6366f1", // Indigo
    "Accomodation": "#10b981", // Emerald
    "Food": "#fbbf24", // Yellow
    "Activities": "#f43f5e", // Rose
    "Souvenirs": "#ec4899", // Pink
    "Flight ticket": "#3b82f6"  // Blue
  };

  // Coordinates and details of Italy Trip nodes for visual representation
  const mapNodes = [
    { city: "Naples", date: "18 Sep", desc: "Arrived at airport, dinner in Naples central", x: 190, y: 310, notes: "Flight U24278 landed at Naples Airport. Checked into Naples hotel. Dinner: 60 EUR." },
    { city: "Sorrento", date: "19 Sep", desc: "Campania Express train, check-in Sorrento Airbnb", x: 175, y: 335, notes: "Sorrento accommodation: 769.56 EUR paid. Explored cliffs and local dining." },
    { city: "Amalfi / Positano", date: "20-21 Sep", desc: "Ferry cruise to Amalfi, bus to Positano scenic coast", x: 195, y: 345, notes: "Ferry tickets cost 104 EUR total. Positano day trip by bus. Enjoyed coastal dinners." },
    { city: "Pompeii", date: "22 Sep", desc: "Morning exploration of archaeological ruins", x: 185, y: 325, notes: "Visited Pompeii Museum (80 EUR) and left bags at storage. Metropolitano train back to Naples." },
    { city: "Rome", date: "22-25 Sep", desc: "Italo train, Vatican museum and Colosseum tickets", x: 140, y: 250, notes: "Rome central accommodation: 817.07 EUR. Visited Colosseum & Vatican City." },
    { city: "Florence", date: "25-27 Sep", desc: "Vibrant art museums, Florence train and Accademia", x: 105, y: 170, notes: "Airbnb Florence: 494.18 EUR. Accademia Gallery tickets: 96 EUR. Florentine steak dinner: 220 EUR." },
    { city: "Rome (Departure)", date: "28 Sep", desc: "Frecciarossa back to Rome, EasyJet fly home", x: 142, y: 255, notes: "Final souvenir shopping (40 EUR). easyJet flight back to Munich / Frankfurt." }
  ];

  // Calculations for active trip
  const totalPlannedBudget = activeTrip.expenses.reduce((sum, e) => sum + (e.budget || 0), 0);
  // Total cost only includes paid expenses
  const totalActualCost = activeTrip.expenses
    .filter(e => e.status === 'paid')
    .reduce((sum, e) => sum + (e.actual || 0), 0);
  
  // Payer statistics
  const participantsList = activeTrip.participants;

  useEffect(() => {
    if (isExpenseModalOpen && participantsList.length > 0) {
      setNewExpInvolved(participantsList);
    }
  }, [isExpenseModalOpen, selectedTripId]);

  // Categories budget vs actual breakdown
  const categoryStats = categories.map(cat => {
    const planned = activeTrip.expenses.filter(e => e.category === cat).reduce((sum, e) => sum + (e.budget || 0), 0);
    const actual = activeTrip.expenses.filter(e => e.category === cat && e.status === 'paid').reduce((sum, e) => sum + (e.actual || 0), 0);
    return {
      name: cat,
      planned,
      actual,
      available: planned - actual,
      color: categoryColors[cat] || "#6b7280"
    };
  });

  const payerStats = participantsList.map(name => {
    const totalPaid = activeTrip.expenses.filter(e => e.paidBy === name && e.status === 'paid').reduce((sum, e) => sum + (e.actual || 0), 0);
    return { name, totalPaid };
  });

  // Calculate settlement/reimbursement transfers dynamically by involved participants
  const personalShares = {};
  participantsList.forEach(p => { personalShares[p] = 0; });
  
  activeTrip.expenses.filter(e => e.status === 'paid').forEach(e => {
    const involved = e.involved && e.involved.length > 0 ? e.involved : participantsList;
    const splitCost = e.actual / involved.length;
    involved.forEach(p => {
      if (personalShares[p] !== undefined) {
        personalShares[p] += splitCost;
      }
    });
  });

  const sharePerPerson = totalActualCost / (participantsList.length || 1); // fallback for dashboard display

  const balances = participantsList.map(name => {
    const paid = activeTrip.expenses.filter(e => e.paidBy === name && e.status === 'paid').reduce((sum, e) => sum + (e.actual || 0), 0);
    const balance = paid - personalShares[name];
    return { name, paid, balance, share: personalShares[name] };
  });

  const calculateTransfers = () => {
    // Group balances by family
    const familyBalances = {};
    
    participantsList.forEach(name => {
      const acc = activeTrip.accounts ? activeTrip.accounts[name] : {};
      const fam = acc.family && acc.family.trim() !== '' ? acc.family.trim() : `Single-${name}`;
      
      if (!familyBalances[fam]) {
        familyBalances[fam] = {
          name: fam,
          balance: 0,
          members: []
        };
      }
      
      const pBal = balances.find(b => b.name === name);
      familyBalances[fam].balance += pBal ? pBal.balance : 0;
      familyBalances[fam].members.push(name);
    });

    const familyList = Object.values(familyBalances);

    // Debtors families (balance < 0)
    let debtors = familyList.filter(f => f.balance < -0.01).map(f => ({ ...f, absBal: Math.abs(f.balance) }));
    // Creditors families (balance > 0)
    let creditors = familyList.filter(f => f.balance > 0.01).map(f => ({ ...f }));

    // Sort descending
    debtors.sort((a, b) => b.absBal - a.absBal);
    creditors.sort((a, b) => b.balance - a.balance);

    let transfers = [];
    let dIdx = 0;
    let cIdx = 0;

    while (dIdx < debtors.length && cIdx < creditors.length) {
      let debtorFam = debtors[dIdx];
      let creditorFam = creditors[cIdx];

      let amount = Math.min(debtorFam.absBal, creditorFam.balance);
      if (amount > 0.01) {
        // Debtor family representative is the one with the lowest balance (paid the least relative to share)
        const debtorRep = debtorFam.members.reduce((lowest, m) => {
          const pBal = balances.find(b => b.name === m);
          const pVal = pBal ? pBal.balance : 0;
          const lowBal = balances.find(b => b.name === lowest);
          const lowVal = lowBal ? lowBal.balance : 0;
          return pVal < lowVal ? m : lowest;
        }, debtorFam.members[0]);

        // Creditor family representative is the one with the highest balance (paid the most relative to share)
        const creditorRep = creditorFam.members.reduce((highest, m) => {
          const pBal = balances.find(b => b.name === m);
          const pVal = pBal ? pBal.balance : 0;
          const highBal = balances.find(b => b.name === highest);
          const highVal = highBal ? highBal.balance : 0;
          return pVal > highVal ? m : highest;
        }, creditorFam.members[0]);

        transfers.push({
          fromFamily: debtorFam.name,
          toFamily: creditorFam.name,
          from: debtorRep,
          to: creditorRep,
          amount: parseFloat(amount.toFixed(2)),
          account: activeTrip.accounts ? activeTrip.accounts[creditorRep] : null
        });
      }

      debtorFam.absBal -= amount;
      creditorFam.balance -= amount;

      if (debtorFam.absBal < 0.01) dIdx++;
      if (creditorFam.balance < 0.01) cIdx++;
    }

    return transfers;
  };

  const transfers = calculateTransfers();

  // Register New Expense
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpActivity || !newExpActual) return;
    
    // Rule: Every expense that doesn't have an associated ticket is considered unpaid/pending.
    // If ticket is checked, status is 'paid'. Otherwise 'pending'.
    const status = newExpHasTicket ? "paid" : "pending";
    
    const newExpense = {
      id: Date.now(),
      date: newExpDate || new Date().toISOString().split('T')[0],
      activity: newExpActivity,
      category: newExpCategory,
      budget: parseFloat(newExpBudget) || 0,
      actual: parseFloat(newExpActual) || 0,
      status: status,
      paidBy: newExpPaidBy || "Thitiwut",
      hasTicket: newExpHasTicket,
      receiptUrl: newExpReceipt || '',
      involved: newExpInvolved.length > 0 ? newExpInvolved : participantsList
    };

    setTrips(prev => prev.map(t => {
      if (t.id === selectedTripId) {
        return {
          ...t,
          expenses: [newExpense, ...t.expenses]
        };
      }
      return t;
    }));

    // Reset Form
    setNewExpActivity('');
    setNewExpBudget('');
    setNewExpActual('');
    setNewExpHasTicket(false);
    setNewExpReceipt('');
    setIsExpenseModalOpen(false);
  };

  // Open Edit Modal with selected expense properties
  const openEditExpenseModal = (exp) => {
    setEditExpId(exp.id);
    setEditExpActivity(exp.activity);
    setEditExpCategory(exp.category);
    setEditExpBudget(exp.budget);
    setEditExpActual(exp.actual);
    setEditExpPaidBy(exp.paidBy || 'Thitiwut');
    setEditExpDate(exp.date);
    setEditExpStatus(exp.status);
    setEditExpHasTicket(exp.hasTicket || false);
    setEditExpReceipt(exp.receiptUrl || '');
    setEditExpInvolved(exp.involved && exp.involved.length > 0 ? exp.involved : participantsList);
    setIsEditModalOpen(true);
  };

  // Handle Edit Expense Submit
  const handleEditExpense = (e) => {
    e.preventDefault();
    
    // Rule: Every expense that doesn't have an associated ticket is considered unpaid/pending.
    const status = editExpHasTicket ? "paid" : "pending";

    setTrips(prev => prev.map(t => {
      if (t.id === selectedTripId) {
        return {
          ...t,
          expenses: t.expenses.map(exp => {
            if (exp.id === editExpId) {
              return {
                ...exp,
                activity: editExpActivity,
                category: editExpCategory,
                budget: parseFloat(editExpBudget) || 0,
                actual: parseFloat(editExpActual) || 0,
                status: status,
                paidBy: editExpPaidBy,
                date: editExpDate,
                hasTicket: editExpHasTicket,
                receiptUrl: editExpReceipt || '',
                involved: editExpInvolved.length > 0 ? editExpInvolved : participantsList
              };
            }
            return exp;
          })
        };
      }
      return t;
    }));

    setIsEditModalOpen(false);
  };

  // Handle Delete Expense
  const handleDeleteExpense = (expenseId) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      setTrips(prev => prev.map(t => {
        if (t.id === selectedTripId) {
          return {
            ...t,
            expenses: t.expenses.filter(e => e.id !== expenseId)
          };
        }
        return t;
      }));
      setIsEditModalOpen(false);
    }
  };

  // Register New Trip
  const handleAddTrip = (e) => {
    e.preventDefault();
    if (!newTripName || !newTripParticipants) return;

    const names = newTripParticipants.split(',').map(n => n.trim()).filter(n => n.length > 0);
    if (names.length === 0) return;

    const defaultAccounts = {};
    names.forEach(name => {
      defaultAccounts[name] = { bankName: "SCB / KBank / BBL", accountNumber: "xxx-x-xxxxx-x", promptPay: "08x-xxx-xxxx" };
    });

    const newTrip = {
      id: "trip-" + Date.now(),
      name: newTripName,
      participants: names,
      accounts: defaultAccounts,
      expenses: [],
      tickets: []
    };

    setTrips(prev => [...prev, newTrip]);
    setSelectedTripId(newTrip.id);
    setIsTripModalOpen(false);
    setNewTripName('');
    setNewTripParticipants('');
  };

  // Update Bank Details
  const handleUpdateBankDetails = (participant, field, value) => {
    setTrips(prev => prev.map(t => {
      if (t.id === selectedTripId) {
        const updatedAccounts = { ...t.accounts };
        if (!updatedAccounts[participant]) {
          updatedAccounts[participant] = { bankName: '', accountNumber: '', promptPay: '' };
        }
        updatedAccounts[participant] = {
          ...updatedAccounts[participant],
          [field]: value
        };
        return {
          ...t,
          accounts: updatedAccounts
        };
      }
      return t;
    }));
  };

  const handleStartEditAccount = (p) => {
    const acc = activeTrip.accounts ? activeTrip.accounts[p] : {};
    setTempBankName(acc?.bankName || '');
    setTempAccountNumber(acc?.accountNumber || '');
    setTempAccountName(acc?.accountName || '');
    setEditingAccountParticipant(p);
  };

  const handleSaveAccountEdit = (p) => {
    handleUpdateBankDetails(p, 'bankName', tempBankName);
    handleUpdateBankDetails(p, 'accountNumber', tempAccountNumber);
    handleUpdateBankDetails(p, 'accountName', tempAccountName);
    setEditingAccountParticipant(null);
  };

  // Get sorted unique dates from activeTrip expenses
  const uniqueDates = Array.from(new Set(activeTrip.expenses.map(e => e.date))).sort();

  // Filter expenses list
  const filteredExpenses = activeTrip.expenses.filter(e => {
    const matchesSearch = e.activity.toLowerCase().includes(expenseSearch.toLowerCase());
    const matchesCategory = expenseCategoryFilter === 'All' || e.category === expenseCategoryFilter;
    const matchesPayer = expensePayerFilter === 'All' || e.paidBy === expensePayerFilter;
    const matchesDate = selectedDateTab === 'All' || e.date === selectedDateTab;
    return matchesSearch && matchesCategory && matchesPayer && matchesDate;
  });

  // Filter tickets by passenger
  const filteredTickets = activeTrip.tickets.filter(ticket => {
    if (selectedFolder === 'All') return true;
    return ticket.passengers.includes(selectedFolder);
  });

  return (
    <>
      <div className="fade-in">
      {/* Top sticky header navigation for desktop */}
      <header className="app-header">
        <div className="logo-container">
          <Compass className="logo-icon animate-pulse" />
          <span className="logo-text">Travel expense tracker</span>
        </div>

        <nav className="nav-links">
          <button className={`nav-btn ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentTab('dashboard')}>
            <PieChart size={16} /> Dashboard
          </button>
          <button className={`nav-btn ${currentTab === 'expenses' ? 'active' : ''}`} onClick={() => setCurrentTab('expenses')}>
            <DollarSign size={16} /> Expenses
          </button>
          <button className={`nav-btn ${currentTab === 'tickets' ? 'active' : ''}`} onClick={() => setCurrentTab('tickets')}>
            <FileText size={16} /> Tickets
          </button>
          <button className={`nav-btn ${currentTab === 'map' ? 'active' : ''}`} onClick={() => setCurrentTab('map')}>
            <CalendarDays size={16} /> Itinerary
          </button>
          <button className={`nav-btn ${currentTab === 'split' ? 'active' : ''}`} onClick={() => setCurrentTab('split')}>
            <RefreshCw size={16} /> Settle Debts
          </button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Refresh/Sync Cloud Button */}
          <button 
            onClick={handleSyncCloud}
            className="btn-action"
            style={{ 
              background: 'rgba(255,255,255,0.06)', 
              border: '1px solid var(--border-color)', 
              cursor: 'pointer', 
              padding: '0.45rem', 
              borderRadius: '8px', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--text-main)',
              height: '38px',
              width: '38px'
            }}
            title="Refresh Data from Cloud"
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          </button>

          {/* Theme Toggle Button */}
          <button 
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className="btn-action"
            style={{ 
              background: 'rgba(255,255,255,0.06)', 
              border: '1px solid var(--border-color)', 
              cursor: 'pointer', 
              padding: '0.45rem', 
              borderRadius: '8px', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--text-main)',
              height: '38px',
              width: '38px'
            }}
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Trip Select dropdown */}
          <select 
            value={selectedTripId} 
            onChange={(e) => {
              if (e.target.value === 'NEW') {
                setIsTripModalOpen(true);
              } else {
                setSelectedTripId(e.target.value);
              }
            }}
            className="form-input"
            style={{ padding: '0.4rem 1.75rem 0.4rem 1rem', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', cursor: 'pointer', height: '38px' }}
          >
            {trips.map(t => (
              <option key={t.id} value={t.id} style={{ background: 'var(--bg-secondary)', color: 'var(--text-main)' }}>{t.name}</option>
            ))}
            <option value="NEW" style={{ background: 'var(--bg-secondary)', color: '#818cf8', fontWeight: 'bold' }}>+ Register New Trip</option>
          </select>
        </div>
      </header>

      {/* Mobile Sticky Bottom Navigation Bar has been relocated outside the fade-in wrapper to fix CSS viewport containment */}

      <main className="container">
        {/* Trip Title and Summary Section */}
        <div className="trip-detail-header">
          <div className="trip-info-block">
            <h1 className="trip-main-title">{activeTrip.name}</h1>
            <div className="trip-participants">
              <span className="trip-meta"><Users size={16} /> Participants: </span>
              {participantsList.map(p => (
                <span key={p} className="participant-chip">{p}</span>
              ))}
            </div>
          </div>

          <div className="action-row">
            {currentTab === 'tickets' ? (
              <button className="btn-action btn-action-primary" onClick={openAddTicketModal}>
                <Plus size={18} /> Add Ticket
              </button>
            ) : (
              <button className="btn-action btn-action-primary" onClick={() => setIsExpenseModalOpen(true)}>
                <Plus size={18} /> Register Expense
              </button>
            )}
          </div>
        </div>

        {/* Dynamic tabs render */}
        {currentTab === 'expenses' && (
          <div className="glass p-6 fade-in" style={{ padding: '2rem' }}>
            <div className="filters-row">
              <div className="search-input" style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Search expenses..." 
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <SlidersHorizontal size={14} style={{ color: 'var(--text-muted)' }} />
                  <select 
                    value={expenseCategoryFilter}
                    onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                    className="form-input select-filter"
                  >
                    <option value="All">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <select 
                  value={expensePayerFilter}
                  onChange={(e) => setExpensePayerFilter(e.target.value)}
                  className="form-input select-filter"
                >
                  <option value="All">All Payers</option>
                  {participantsList.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
            </div>
          </div>

          {/* Unique dates scrollable sub-tabs */}
            <div className="tabs-container" style={{ margin: '1rem 0 1.5rem 0', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <button 
                className={`tab-link ${selectedDateTab === 'All' ? 'active' : ''}`}
                onClick={() => setSelectedDateTab('All')}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', borderRadius: '6px' }}
              >
                All Days ({activeTrip.expenses.length})
              </button>
              {uniqueDates.map(dateStr => (
                <button 
                  key={dateStr}
                  className={`tab-link ${selectedDateTab === dateStr ? 'active' : ''}`}
                  onClick={() => setSelectedDateTab(dateStr)}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', borderRadius: '6px' }}
                >
                  {formatDateLabel(dateStr)} ({activeTrip.expenses.filter(e => e.date === dateStr).length})
                </button>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="expenses-table-container">
              <table className="expenses-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Activity</th>
                    <th>Category</th>
                    <th>Budget (€)</th>
                    <th>Actual Paid (€)</th>
                    <th>Status</th>
                    <th>Paid By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No expenses match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map(e => (
                      <tr key={e.id}>
                        <td style={{ color: 'var(--text-muted)' }}>{e.date}</td>
                        <td style={{ fontWeight: '500', color: 'var(--text-heading)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {e.activity}
                              {e.hasTicket && <Ticket size={14} style={{ color: '#10b981' }} title="Has associated ticket" />}
                            </div>
                            {e.involved && e.involved.length < participantsList.length && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '0.2rem', fontWeight: '400' }}>
                                👥 เฉพาะ: {e.involved.join(', ')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="category-badge" style={{ borderLeft: `3px solid ${categoryColors[e.category] || '#6b7280'}` }}>
                            {e.category}
                          </span>
                        </td>
                        <td>{e.budget ? `€${e.budget.toFixed(2)}` : '-'}</td>
                        <td style={{ fontWeight: '600', color: e.actual > e.budget && e.budget > 0 && e.status === 'paid' ? 'var(--danger)' : 'var(--text-heading)' }}>
                          {e.status === 'paid' ? `€${e.actual.toFixed(2)}` : '-'}
                        </td>
                        <td>
                          <span className={`status-badge ${e.status}`}>
                            {e.status === 'paid' ? <Check size={12} /> : null}
                            {e.status}
                          </span>
                        </td>
                        <td style={{ fontWeight: '500' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                            <User size={12} style={{ color: 'var(--primary)' }} />
                            {e.paidBy || 'Thitiwut'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                            {e.receiptUrl && (
                              <button
                                onClick={() => setPreviewReceiptUrl({ url: e.receiptUrl, title: e.activity })}
                                className="btn-action"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: '600' }}
                              >
                                <Receipt size={12} /> Bill
                              </button>
                            )}
                            <button 
                              onClick={() => openEditExpenseModal(e)} 
                              className="btn-action" 
                              style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                              <Edit2 size={12} /> Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="mobile-expense-cards">
              {filteredExpenses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No expenses match your filters.
                </div>
              ) : (
                filteredExpenses.map(e => (
                  <div key={e.id} className="glass-interactive mobile-expense-card">
                    <div className="mobile-card-row">
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{e.date}</span>
                      <span className="category-badge" style={{ borderLeft: `3px solid ${categoryColors[e.category] || '#6b7280'}` }}>
                        {e.category}
                      </span>
                    </div>

                    <div style={{ fontWeight: '600', color: 'var(--text-heading)', fontSize: '1rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {e.activity}
                        {e.hasTicket && <Ticket size={14} style={{ color: '#10b981' }} />}
                      </div>
                      {e.involved && e.involved.length < participantsList.length && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: '400' }}>
                          👥 เฉพาะ: {e.involved.join(', ')}
                        </span>
                      )}
                    </div>

                    <div className="mobile-card-row" style={{ marginTop: '0.25rem' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Planned Budget</div>
                        <div style={{ fontSize: '0.85rem' }}>{e.budget ? `€${e.budget.toFixed(2)}` : '-'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Actual Paid</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-heading)' }}>
                          {e.status === 'paid' ? `€${e.actual.toFixed(2)}` : '-'}
                        </div>
                      </div>
                    </div>

                    <div className="mobile-card-row" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                      <span className={`status-badge ${e.status}`}>
                        {e.status === 'paid' ? <Check size={10} /> : null}
                        {e.status}
                      </span>
                      
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Paid by: {e.paidBy || 'Thitiwut'}</span>
                        {e.receiptUrl && (
                          <button
                            onClick={() => setPreviewReceiptUrl({ url: e.receiptUrl, title: e.activity })}
                            className="btn-action"
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: '600' }}
                          >
                            <Receipt size={12} /> Bill
                          </button>
                        )}
                        <button 
                          onClick={() => openEditExpenseModal(e)} 
                          className="btn-action" 
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          <Edit2 size={10} /> Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {currentTab === 'dashboard' && (
          <div className="fade-in">
            {/* Quick summary stats */}
            <div className="dashboard-grid">
              <div className="glass stat-card">
                <div className="stat-card-header">
                  <span>Actual Paid Expenses</span>
                  <DollarSign size={18} style={{ color: 'var(--primary)' }} />
                </div>
                <div className="stat-card-value">€{totalActualCost.toFixed(2)}</div>
                <div className="stat-card-desc">Total of PAID expenses across the trip</div>
              </div>

              <div className="glass stat-card">
                <div className="stat-card-header">
                  <span>Planned Budget</span>
                  <Calendar size={18} style={{ color: 'var(--success)' }} />
                </div>
                <div className="stat-card-value">€{totalPlannedBudget.toFixed(2)}</div>
                <div className="stat-card-desc">Initial estimated cost (Total: €{totalPlannedBudget.toFixed(0)})</div>
              </div>

              <div className="glass stat-card">
                <div className="stat-card-header">
                  <span>Savings / Remaining</span>
                  <TrendingUp size={18} style={{ color: totalPlannedBudget - totalActualCost >= 0 ? 'var(--success)' : 'var(--danger)' }} />
                </div>
                <div className="stat-card-value" style={{ color: totalPlannedBudget - totalActualCost >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  €{(totalPlannedBudget - totalActualCost).toFixed(2)}
                </div>
                <div className="stat-card-desc">
                  {totalPlannedBudget - totalActualCost >= 0 ? "Under planned budget" : "Exceeded planned budget"}
                </div>
              </div>
            </div>

            {/* Visual breakdown graphs */}
            <div className="analytics-section">
              <div className="glass chart-card">
                <div className="chart-title">
                  <PieChart size={18} style={{ color: 'var(--primary)' }} /> Category Spending Breakdown
                </div>
                <div className="category-list">
                  {categoryStats.map(stat => {
                    const percentage = totalActualCost > 0 ? (stat.actual / totalActualCost) * 100 : 0;
                    return (
                      <div key={stat.name} className="category-item">
                        <div className="category-info">
                          <span className="category-color-dot" style={{ backgroundColor: stat.color }}></span>
                          <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{stat.name}</span>
                        </div>
                        <div className="category-bar-wrapper">
                          <div className="progress-bar-bg" style={{ height: '6px' }}>
                            <div className="progress-bar-fill" style={{ width: `${percentage}%`, backgroundColor: stat.color }}></div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: '600', color: 'var(--text-heading)' }}>€{stat.actual.toFixed(2)}</span>
                          <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontSize: '0.75rem' }}>({percentage.toFixed(0)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="glass chart-card">
                <div className="chart-title">
                  <Users size={18} style={{ color: 'var(--success)' }} /> Personal Outlays (Who Paid)
                </div>
                <div className="category-list">
                  {payerStats.map(payer => {
                    const percentage = totalActualCost > 0 ? (payer.totalPaid / totalActualCost) * 100 : 0;
                    return (
                      <div key={payer.name} className="category-item">
                        <div className="category-info">
                          <User size={16} style={{ color: 'var(--primary)' }} />
                          <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{payer.name}</span>
                        </div>
                        <div className="category-bar-wrapper">
                          <div className="progress-bar-bg" style={{ height: '6px' }}>
                            <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: '600', color: 'var(--text-heading)' }}>€{payer.totalPaid.toFixed(2)}</span>
                          <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontSize: '0.75rem' }}>({percentage.toFixed(0)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="account-setup-card" style={{ marginTop: '2rem', background: 'rgba(99, 102, 241, 0.05)', border: '1px dashed var(--primary)' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <AlertTriangle size={18} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                      Shared Equal Split Plan: €{sharePerPerson.toFixed(2)} per person.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tickets and Downloads Tab */}
        {currentTab === 'tickets' && (
          <div className="glass fade-in" style={{ padding: '2rem' }}>
            {activeTrip.tickets && activeTrip.tickets.length > 0 ? (
              <div className="tickets-layout">
                {/* Folder sidebar */}
                <div className="folder-sidebar">
                  <div className="sidebar-title">Folders</div>
                  <button className={`folder-btn ${selectedFolder === 'All' ? 'active' : ''}`} onClick={() => setSelectedFolder('All')}>
                    {selectedFolder === 'All' ? <FolderOpen size={18} /> : <Folder size={18} />}
                    <span>All Tickets</span>
                  </button>
                  {participantsList.map(p => (
                    <button key={p} className={`folder-btn ${selectedFolder === p ? 'active' : ''}`} onClick={() => setSelectedFolder(p)}>
                      {selectedFolder === p ? <FolderOpen size={18} /> : <Folder size={18} />}
                      <span>{p}'s Folder</span>
                    </button>
                  ))}
                </div>

                {/* Tickets grid */}
                <div>
                  <div className="sidebar-title" style={{ paddingLeft: 0, marginBottom: '1rem' }}>
                    Files ({filteredTickets.length})
                  </div>
                  <div className="ticket-files-grid">
                    {filteredTickets.map((t, idx) => (
                      <div key={idx} className="glass-interactive ticket-card">
                        <div>
                          <FileText className="ticket-file-icon" size={24} />
                          <div className="ticket-name">{t.name}</div>
                          <div className="ticket-passengers">
                            {t.passengers.map(pass => (
                              <span key={pass} className="ticket-pass-chip">{pass}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem' }}>
                          <button
                            onClick={() => setPreviewTicket(t)}
                            className="btn-action"
                            style={{
                              flex: 1,
                              padding: '0.4rem 0.5rem',
                              fontSize: '0.75rem',
                              background: 'rgba(99, 102, 241, 0.15)',
                              border: '1px solid rgba(99, 102, 241, 0.3)',
                              color: '#a5b4fc',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.25rem',
                              fontWeight: '600'
                            }}
                          >
                            <Eye size={13} /> Preview
                          </button>
                          <a 
                            href={`/tickets/${encodeURIComponent(t.file)}`} 
                            download={t.name}
                            className="ticket-download-link"
                            style={{ flex: 1, textAlign: 'center', justifyContent: 'center', padding: '0.4rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            <Download size={13} /> Download
                          </a>
                          <button
                            onClick={() => handleDeleteTicket(t)}
                            className="btn-action"
                            title="Delete Ticket"
                            style={{
                              padding: '0.4rem 0.5rem',
                              fontSize: '0.75rem',
                              background: 'rgba(239, 68, 68, 0.12)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#f87171',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No booking tickets uploaded for this trip yet.
              </div>
            )}
          </div>
        )}

        {/* Itinerary Tab */}
        {currentTab === 'map' && (() => {
          // Fix Leaflet default icon
          delete L.Icon.Default.prototype._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          });

          const itineraryDays = [
            {
              day: 'Day 1', date: 'Fri 19 Sep', city: 'Naples 🇮🇹', emoji: '✈️',
              lat: 40.8518, lng: 14.2681,
              activities: [
                { time: '06:00', label: 'Depart Bangkok → Frankfurt → Naples (U24278)' },
                { time: '18:00', label: 'Arrive Naples Airport (NAP)' },
                { time: '19:30', label: 'Check-in Naples hotel' },
                { time: '20:30', label: 'Dinner in Naples centro storico' },
              ]
            },
            {
              day: 'Day 2', date: 'Sat 20 Sep', city: 'Sorrento 🌊', emoji: '🚂',
              lat: 40.6263, lng: 14.3757,
              activities: [
                { time: '09:00', label: 'Campania Express train Naples → Sorrento' },
                { time: '11:00', label: 'Check-in Sorrento Airbnb (€769.56)' },
                { time: '14:00', label: 'Explore Sorrento cliffs & old town' },
                { time: '19:00', label: 'Dinner with sea view at Villa Comunale' },
              ]
            },
            {
              day: 'Day 3', date: 'Sun 21 Sep', city: 'Amalfi Coast 🚤', emoji: '⛴️',
              lat: 40.6340, lng: 14.6027,
              activities: [
                { time: '09:00', label: 'Ferry from Sorrento → Amalfi (€104 total)' },
                { time: '11:00', label: 'Walk Amalfi old town & Duomo di Amalfi' },
                { time: '14:00', label: 'Ferry → Positano — gelato & beach' },
                { time: '17:00', label: 'Bus back to Sorrento' },
              ]
            },
            {
              day: 'Day 4', date: 'Mon 22 Sep', city: 'Pompeii → Rome 🏛️', emoji: '🏺',
              lat: 40.7462, lng: 13.9036,
              activities: [
                { time: '08:00', label: 'Morning checkout Sorrento' },
                { time: '09:30', label: 'Train to Pompeii — explore ruins (€80)' },
                { time: '14:00', label: 'Metropolitano train to Naples Centrale' },
                { time: '16:00', label: 'Italo train Naples → Rome Termini' },
                { time: '18:30', label: 'Check-in Rome hotel (€817.07)' },
              ]
            },
            {
              day: 'Day 5', date: 'Tue 23 Sep', city: 'Rome — Vatican 🙏', emoji: '⛪',
              lat: 41.9029, lng: 12.4534,
              activities: [
                { time: '08:30', label: 'Vatican Museums & Sistine Chapel' },
                { time: '12:00', label: "St. Peter's Basilica & Square" },
                { time: '15:00', label: "Castel Sant'Angelo walk" },
                { time: '19:30', label: 'Dinner near Piazza Navona' },
              ]
            },
            {
              day: 'Day 6', date: 'Wed 24 Sep', city: 'Rome — Colosseum 🏟️', emoji: '🗿',
              lat: 41.8902, lng: 12.4922,
              activities: [
                { time: '09:00', label: 'Colosseum & Roman Forum & Palatine Hill' },
                { time: '13:00', label: 'Lunch at Testaccio market' },
                { time: '15:00', label: 'Trevi Fountain & Spanish Steps' },
                { time: '20:00', label: 'Dinner: Roman pasta & tiramisu' },
              ]
            },
            {
              day: 'Day 7', date: 'Thu 25 Sep', city: 'Florence 🌸', emoji: '🚄',
              lat: 43.7696, lng: 11.2558,
              activities: [
                { time: '08:00', label: 'Checkout Rome hotel' },
                { time: '09:30', label: 'Frecciarossa train Rome → Florence (1h30m)' },
                { time: '11:30', label: 'Check-in Florence Airbnb (€494.18)' },
                { time: '14:00', label: 'Uffizi Gallery walk & Piazzale Michelangelo' },
                { time: '20:00', label: 'Florentine steak dinner (€220)' },
              ]
            },
            {
              day: 'Day 8', date: 'Fri 26 Sep', city: 'Florence — Art 🎨', emoji: '🖼️',
              lat: 43.7769, lng: 11.2600,
              activities: [
                { time: '09:00', label: 'Accademia Gallery — David by Michelangelo (€96)' },
                { time: '12:00', label: 'Mercato Centrale lunch' },
                { time: '14:00', label: 'Ponte Vecchio & Oltrarno neighbourhood' },
                { time: '19:30', label: 'Dinner + Aperol Spritz at local trattoria' },
              ]
            },
            {
              day: 'Day 9', date: 'Sat 27 Sep', city: 'Florence → Rome 🏁', emoji: '🛍️',
              lat: 41.9028, lng: 12.4964,
              activities: [
                { time: '09:00', label: 'Last Florence sightseeing & shopping' },
                { time: '13:00', label: 'Frecciarossa train Florence → Rome' },
                { time: '15:00', label: 'Souvenir shopping Rome (€40)' },
                { time: '19:00', label: 'Final dinner near Termini' },
              ]
            },
            {
              day: 'Day 10', date: 'Sun 28 Sep', city: 'Fly Home ✈️', emoji: '🏠',
              lat: 41.7999, lng: 12.2462,
              activities: [
                { time: '05:00', label: 'Hotel checkout' },
                { time: '06:30', label: 'Transfer to Fiumicino Airport (FCO)' },
                { time: '09:00', label: 'EasyJet flight Rome → Frankfurt/Munich' },
                { time: '20:00', label: 'Connect Bangkok flight home 🏠' },
              ]
            },
          ];

          const routePositions = itineraryDays.map(d => [d.lat, d.lng]);
          const customIcon = (active) => L.divIcon({
            className: '',
            html: `<div style="width:${active?20:14}px;height:${active?20:14}px;background:${active?'#ef4444':'#6366f1'};border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4);transition:all 0.2s"></div>`,
            iconSize: [active?20:14, active?20:14],
            iconAnchor: [active?10:7, active?10:7],
          });

          return (
            <div className="fade-in" style={{ paddingBottom: '5rem' }}>
              {/* Real Leaflet Map */}
              <div className="glass" style={{ borderRadius: '1.25rem', overflow: 'hidden', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem 1.25rem 0.5rem' }}>
                  <h2 style={{ color: 'var(--text-heading)', margin: 0, fontSize: '1.2rem' }}>🗺️ Italy Trip Route</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>Pinch to zoom • Tap markers for details</p>
                </div>
                <MapContainer
                  center={[42.0, 13.5]}
                  zoom={6}
                  style={{ height: '380px', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Polyline
                    positions={routePositions}
                    pathOptions={{ color: '#6366f1', weight: 3, dashArray: '8 6', opacity: 0.85 }}
                  />
                  {itineraryDays.map((d, i) => (
                    <Marker
                      key={i}
                      position={[d.lat, d.lng]}
                      icon={customIcon(selectedMapNode === i)}
                      eventHandlers={{ click: () => setSelectedMapNode(i) }}
                    >
                      <Popup>
                        <strong>{d.day}: {d.city}</strong><br />{d.date}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {/* Day-by-Day Itinerary Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {itineraryDays.map((d, i) => (
                  <div
                    key={i}
                    className="glass"
                    onClick={() => setSelectedMapNode(i)}
                    style={{
                      borderRadius: '1rem',
                      padding: '1rem 1.25rem',
                      cursor: 'pointer',
                      border: selectedMapNode === i ? '1.5px solid #6366f1' : '1.5px solid transparent',
                      background: selectedMapNode === i ? 'rgba(99,102,241,0.08)' : undefined,
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '0.6rem',
                        background: selectedMapNode === i ? '#6366f1' : 'var(--bg-card-alt)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.2rem', flexShrink: 0
                      }}>{d.emoji}</div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.95rem' }}>{d.day} — {d.city}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{d.date}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {d.activities.map((act, j) => (
                        <div key={j} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                          <span style={{
                            fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 600,
                            minWidth: 40, paddingTop: '0.1rem', fontFamily: 'monospace'
                          }}>{act.time}</span>
                          <span style={{ fontSize: '0.83rem', color: 'var(--text-body)', lineHeight: 1.45 }}>{act.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Debt settlement calculator panel */}
        {currentTab === 'split' && (
          <div className="reimbursement-layout fade-in">
            {/* Left Column: Settlement Actions */}
            <div className="glass calculator-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h2 style={{ color: 'var(--text-heading)', marginBottom: '0.25rem', fontSize: '1.1rem', overflowWrap: 'break-word' }}>Reimbursement Payments</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', overflowWrap: 'break-word' }}>
                    WanderLedger balances the ledger with the fewest transfers.
                  </p>
                </div>
                <button 
                  className="btn-action animate-pulse" 
                  onClick={() => setIsFamilyModalOpen(true)} 
                  style={{ background: 'rgba(251, 191, 36, 0.15)', border: '1px solid rgba(251, 191, 36, 0.3)', color: 'var(--warning)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                >
                  <Users size={14} /> Organize Families
                </button>
              </div>

              {transfers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--success)' }}>
                  <Check size={48} style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ color: 'var(--text-heading)' }}>Ledger is Balanced</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>No payments are currently needed.</p>
                </div>
              ) : (
                <div className="transfer-instruction-list">
                  {transfers.map((tr, idx) => {
                    const fromFamLabel = tr.fromFamily.startsWith('Single-') ? tr.from : tr.fromFamily;
                    const toFamLabel = tr.toFamily.startsWith('Single-') ? tr.to : tr.toFamily;
                    return (
                      <div key={idx} className="transfer-item">
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div className="transfer-actor">
                            <span style={{ fontWeight: '700', color: '#ffb088' }}>{fromFamLabel}</span>
                            <span className="transfer-arrow">pays</span>
                            <span style={{ fontWeight: '700', color: '#818cf8' }}>{toFamLabel}</span>
                          </div>
                          
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            (Representative transaction: <span style={{ color: 'var(--text-heading)' }}>{tr.from}</span> to <span style={{ color: 'var(--text-heading)' }}>{tr.to}</span>)
                          </div>

                          {tr.account && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              <div>🏦 ธนาคาร: <span style={{ color: 'var(--text-heading)', fontWeight: '500' }}>{tr.account.bankName}</span></div>
                              <div>👤 เจ้าของบัญชี: <span style={{ color: 'var(--text-heading)', fontWeight: '500' }}>{tr.account.accountName || tr.to}</span></div>
                              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                <span>💳 เลขบัญชี: </span>
                                <span style={{ color: 'var(--text-heading)', fontWeight: '500', marginLeft: '0.25rem' }}>{tr.account.accountNumber}</span>
                                <button 
                                  onClick={() => handleCopyText(tr.account.accountNumber, `bank-${idx}`)}
                                  className="btn-action animate-pulse"
                                  style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem', marginLeft: '0.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                >
                                  <Copy size={10} />
                                  {copiedId === `bank-${idx}` ? "Copied!" : "Copy"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="transfer-amount" style={{ color: 'var(--warning)', fontWeight: 'bold' }}>
                          €{tr.amount.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Calculation Detail Breakdown Section */}
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCalcDetail(!showCalcDetail)}
                  className="btn-action"
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 1rem', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '8px', color: 'var(--text-heading)', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calculator size={16} style={{ color: 'var(--primary)' }} />
                    รายละเอียดขั้นตอนการคำนวณ (Calculation Breakdown)
                  </span>
                  {showCalcDetail ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showCalcDetail && (
                  <div className="fade-in" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-main)' }}>
                    
                    {/* Step 1: Individual Shares */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-heading)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Info size={14} style={{ color: 'var(--primary)' }} />
                        1. สรุปยอดจ่ายจริงและค่าใช้จ่ายรายคน (Individual Outlay & Share)
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {balances.map(b => (
                          <div key={b.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0.5rem', background: 'rgba(0,0,0,0.1)', borderRadius: '6px' }}>
                            <div>
                              <span style={{ fontWeight: '600', color: 'var(--text-heading)' }}>{b.name}</span>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                จ่ายออกจริง: €{b.paid.toFixed(2)} | ส่วนหารที่ต้องรับผิดชอบ: €{b.share.toFixed(2)}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', fontWeight: '700', color: b.balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                              {b.balance >= 0 ? `+€${b.balance.toFixed(2)} (ได้รับคืน)` : `-€${Math.abs(b.balance).toFixed(2)} (ต้องจ่าย)`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step 2: Family Grouping */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-heading)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Users size={14} style={{ color: 'var(--warning)' }} />
                        2. สรุปยอดสุทธิตามกลุ่มตระกูล (Family Net Balance)
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {(() => {
                          const famBals = {};
                          participantsList.forEach(p => {
                            const acc = activeTrip.accounts ? activeTrip.accounts[p] : {};
                            const fam = acc.family && acc.family.trim() !== '' ? acc.family.trim() : `Single-${p}`;
                            if (!famBals[fam]) famBals[fam] = { name: fam, members: [], sumBal: 0 };
                            const pBal = balances.find(b => b.name === p);
                            famBals[fam].members.push(p);
                            famBals[fam].sumBal += pBal ? pBal.balance : 0;
                          });
                          return Object.values(famBals).map(f => (
                            <div key={f.name} style={{ padding: '0.35rem 0.5rem', background: 'rgba(0,0,0,0.1)', borderRadius: '6px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '600', color: 'var(--text-heading)' }}>{f.name.startsWith('Single-') ? f.members[0] : f.name} ({f.members.join(', ')})</span>
                                <span style={{ fontWeight: '700', color: f.sumBal >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                  {f.sumBal >= 0 ? `+€${f.sumBal.toFixed(2)}` : `-€${Math.abs(f.sumBal).toFixed(2)}`}
                                </span>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    {/* Step 3: Transfers Logic Explanation */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-heading)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Check size={14} style={{ color: 'var(--success)' }} />
                        3. ผลลัพธ์การหักกลบสบหนี้ (Minimal Transfer Matching)
                      </div>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        ระบบจับคู่ยอดจ่ายสุทธิระหว่างตระกูลเพื่อลดจำนวนครั้งในการโอนให้มากที่สุด โดยกลุ่มตระกูลที่มียอดติดลบจะโอนตรงเข้าบัญชีกลุ่มตระกูลที่มียอดบวก
                      </p>
                    </div>

                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Participant accounts configuration */}
            <div className="glass calculator-card">
              <h2 style={{ color: 'var(--text-heading)', marginBottom: '0.5rem' }}>Bank Accounts setup</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Add your bank accounts so friends can transfer back immediately.
              </p>

              <div className="repayment-accounts">
                {participantsList.map(p => {
                  const acc = activeTrip.accounts ? activeTrip.accounts[p] : { bankName: '', accountNumber: '', accountName: '' };
                  const isEditing = editingAccountParticipant === p;
                  return (
                    <div key={p} className="account-setup-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: '700', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                          <CreditCard size={14} style={{ color: 'var(--primary)' }} />
                          {p}'s Account
                        </div>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button 
                              onClick={() => handleSaveAccountEdit(p)}
                              className="btn-action"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', background: 'var(--primary)', color: '#fff', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontWeight: '600' }}
                            >
                              <Check size={11} /> Save
                            </button>
                            <button 
                              onClick={() => setEditingAccountParticipant(null)}
                              className="btn-action"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                            >
                              <X size={11} /> Cancel
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleStartEditAccount(p)}
                            className="btn-action"
                            style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: '600' }}
                          >
                            <Edit2 size={11} /> Edit
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="account-form-grid">
                          <input 
                            type="text" 
                            placeholder="Bank Name (e.g. KBank / N26)" 
                            value={tempBankName} 
                            onChange={(e) => setTempBankName(e.target.value)}
                            className="form-input"
                            style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                          />
                          <input 
                            type="text" 
                            placeholder="Account Number" 
                            value={tempAccountNumber} 
                            onChange={(e) => setTempAccountNumber(e.target.value)}
                            className="form-input"
                            style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                          />
                          <input 
                            type="text" 
                            placeholder="Account Owner Name (ชื่อเจ้าของบัญชี)" 
                            value={tempAccountName} 
                            onChange={(e) => setTempAccountName(e.target.value)}
                            className="form-input"
                            style={{ fontSize: '0.8rem', padding: '0.4rem', gridColumn: 'span 2' }}
                          />
                          <input 
                            type="text" 
                            readOnly
                            placeholder="Family Group (Organize via button above)" 
                            value={acc?.family ? `Family: ${acc.family}` : 'No Family Group'} 
                            className="form-input"
                            title="Change family assignment using the 'Organize Families' button above"
                            style={{ fontSize: '0.8rem', padding: '0.4rem', gridColumn: 'span 2', borderLeft: '3px solid var(--warning)', opacity: 0.75, cursor: 'not-allowed', background: 'rgba(255, 255, 255, 0.04)' }}
                          />
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.35rem' }}>
                          {acc?.bankName || acc?.accountNumber || acc?.accountName ? (
                            <>
                              <div>🏦 ธนาคาร: <span style={{ color: 'var(--text-heading)', fontWeight: '500' }}>{acc.bankName || '-'}</span></div>
                              <div>👤 เจ้าของบัญชี: <span style={{ color: 'var(--text-heading)', fontWeight: '500' }}>{acc.accountName || p}</span></div>
                              <div>💳 เลขบัญชี: <span style={{ color: 'var(--text-heading)', fontWeight: '500' }}>{acc.accountNumber || '-'}</span></div>
                              <div>🏠 กลุ่ม: <span style={{ color: 'var(--warning)', fontWeight: '500' }}>{acc.family ? `Family ${acc.family}` : 'ไม่ระบุ'}</span></div>
                            </>
                          ) : (
                            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.78rem' }}>
                              ยังไม่ได้ตั้งค่าบัญชี — กดปุ่ม Edit ด้านบนเพื่อใส่ข้อมูล
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>

      {/* Overlay Register Expense Modal */}
      {isExpenseModalOpen && (
        <div className="modal-overlay">
          <div className="glass modal-content fade-in">
            <button className="modal-close" onClick={() => setIsExpenseModalOpen(false)}>
              <X size={20} />
            </button>
            <h3 className="form-title">Register Expense</h3>
            <form onSubmit={handleAddExpense} className="form-grid">
              <div className="form-field">
                <label className="form-label">Activity Name / Detail</label>
                <input 
                  type="text" 
                  value={newExpActivity} 
                  onChange={(e) => setNewExpActivity(e.target.value)} 
                  placeholder="e.g. Dinner in Sorrento" 
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row-grid">
                <div className="form-field">
                  <label className="form-label">Category</label>
                  <select 
                    value={newExpCategory} 
                    onChange={(e) => setNewExpCategory(e.target.value)}
                    className="form-input"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">Date</label>
                    <button 
                      type="button" 
                      onClick={() => setNewExpDate("2026-07-31")}
                      style={{ background: 'none', border: 'none', color: 'var(--warning)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                    >
                      Pre-Trip (31 Jul)
                    </button>
                  </div>
                  <input 
                    type="date" 
                    value={newExpDate} 
                    onChange={(e) => setNewExpDate(e.target.value)} 
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row-grid">
                <div className="form-field">
                  <label className="form-label">Planned Budget (€)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={newExpBudget} 
                    onChange={(e) => setNewExpBudget(e.target.value)} 
                    placeholder="0.00" 
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Actual Paid (€)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={newExpActual} 
                    onChange={(e) => setNewExpActual(e.target.value)} 
                    placeholder="0.00" 
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Who Paid?</label>
                <select 
                  value={newExpPaidBy} 
                  onChange={(e) => setNewExpPaidBy(e.target.value)}
                  className="form-input"
                >
                  {participantsList.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Involved (คนที่มีส่วนร่วม - ค่าเริ่มต้น: ทุกคน)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {participantsList.map(p => (
                    <label key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', userSelect: 'none' }}>
                      <input 
                        type="checkbox"
                        checked={newExpInvolved.includes(p)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewExpInvolved(prev => [...prev, p]);
                          } else {
                            setNewExpInvolved(prev => prev.filter(item => item !== p));
                          }
                        }}
                        style={{ cursor: 'pointer', width: '14px', height: '14px' }}
                      />
                      <span>{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Attach Bill / Receipt (แนบสลิป / ใบเสร็จ)</label>
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  onChange={(evt) => handleReceiptFileUpload(evt.target.files[0], setNewExpReceipt)} 
                  className="form-input"
                  style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                />
                {newExpReceipt && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>✓ Bill Attached</span>
                    <button 
                      type="button" 
                      onClick={() => setNewExpReceipt('')} 
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="form-field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="newExpHasTicket" 
                  checked={newExpHasTicket} 
                  onChange={(e) => setNewExpHasTicket(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="newExpHasTicket" className="form-label" style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Paid (จ่ายแล้ว)
                </label>
              </div>

              <button type="submit" className="btn-submit">Save Expense</button>
            </form>
          </div>
        </div>
      )}

      {/* Overlay Edit Expense Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="glass modal-content fade-in">
            <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>
              <X size={20} />
            </button>
            <h3 className="form-title">Edit Expense</h3>
            <form onSubmit={handleEditExpense} className="form-grid">
              <div className="form-field">
                <label className="form-label">Activity Name / Detail</label>
                <input 
                  type="text" 
                  value={editExpActivity} 
                  onChange={(e) => setEditExpActivity(e.target.value)} 
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row-grid">
                <div className="form-field">
                  <label className="form-label">Category</label>
                  <select 
                    value={editExpCategory} 
                    onChange={(e) => setEditExpCategory(e.target.value)}
                    className="form-input"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">Date</label>
                    <button 
                      type="button" 
                      onClick={() => setEditExpDate("2026-07-31")}
                      style={{ background: 'none', border: 'none', color: 'var(--warning)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                    >
                      Pre-Trip (31 Jul)
                    </button>
                  </div>
                  <input 
                    type="date" 
                    value={editExpDate} 
                    onChange={(e) => setEditExpDate(e.target.value)} 
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row-grid">
                <div className="form-field">
                  <label className="form-label">Planned Budget (€)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={editExpBudget} 
                    onChange={(e) => setEditExpBudget(e.target.value)} 
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Actual Paid (€)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={editExpActual} 
                    onChange={(e) => setEditExpActual(e.target.value)} 
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Who Paid?</label>
                <select 
                  value={editExpPaidBy} 
                  onChange={(e) => setEditExpPaidBy(e.target.value)}
                  className="form-input"
                >
                  {participantsList.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Involved (คนที่มีส่วนร่วม - ค่าเริ่มต้น: ทุกคน)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {participantsList.map(p => (
                    <label key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', userSelect: 'none' }}>
                      <input 
                        type="checkbox"
                        checked={editExpInvolved.includes(p)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditExpInvolved(prev => [...prev, p]);
                          } else {
                            setEditExpInvolved(prev => prev.filter(item => item !== p));
                          }
                        }}
                        style={{ cursor: 'pointer', width: '14px', height: '14px' }}
                      />
                      <span>{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Attach Bill / Receipt (แนบสลิป / ใบเสร็จ)</label>
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  onChange={(evt) => handleReceiptFileUpload(evt.target.files[0], setEditExpReceipt)} 
                  className="form-input"
                  style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                />
                {editExpReceipt && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>✓ Bill Attached</span>
                    <button 
                      type="button" 
                      onClick={() => setEditExpReceipt('')} 
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="form-field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="editExpHasTicket" 
                  checked={editExpHasTicket} 
                  onChange={(e) => setEditExpHasTicket(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="editExpHasTicket" className="form-label" style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Paid (จ่ายแล้ว)
                </label>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-submit" style={{ marginTop: 0 }}>Save Changes</button>
                <button 
                  type="button" 
                  onClick={() => handleDeleteExpense(editExpId)}
                  className="btn-submit"
                  style={{ background: 'var(--danger)', marginTop: 0 }}
                >
                  Delete Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Overlay Register Trip Modal */}
      {isTripModalOpen && (
        <div className="modal-overlay">
          <div className="glass modal-content fade-in">
            <button className="modal-close" onClick={() => setIsTripModalOpen(false)}>
              <X size={20} />
            </button>
            <h3 className="form-title">Register New Trip</h3>
            <form onSubmit={handleAddTrip} className="form-grid">
              <div className="form-field">
                <label className="form-label">Trip Name</label>
                <input 
                  type="text" 
                  value={newTripName} 
                  onChange={(e) => setNewTripName(e.target.value)} 
                  placeholder="e.g. Japan Autumn 2026" 
                  className="form-input"
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-label">Participants (Comma separated names)</label>
                <input 
                  type="text" 
                  value={newTripParticipants} 
                  onChange={(e) => setNewTripParticipants(e.target.value)} 
                  placeholder="e.g. Alice, Bob, Charlie" 
                  className="form-input"
                  required
                />
              </div>

              <button type="submit" className="btn-submit">Create Trip</button>
            </form>
          </div>
        </div>
      )}

      {/* Overlay Family Organize Modal */}
      {isFamilyModalOpen && (
        <div className="modal-overlay">
          <div className="glass modal-content fade-in" style={{ maxWidth: '550px', width: '90%' }}>
            <button className="modal-close" onClick={() => setIsFamilyModalOpen(false)}>
              <X size={20} />
            </button>
            <h3 className="form-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Users size={22} style={{ color: 'var(--warning)' }} />
              Family Groups Organizer
            </h3>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Assign members to family groups. Members in the same group will not settle debts with each other.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Assign form */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ color: 'var(--text-heading)', fontSize: '0.9rem', marginBottom: '1rem' }}>Assign Members</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {participantsList.map(p => {
                    const currentFam = activeTrip.accounts?.[p]?.family || '';
                    return (
                      <div key={p} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-heading)' }}>👤 {p}</span>
                        <select
                          value={currentFam}
                          onChange={(e) => handleUpdateBankDetails(p, 'family', e.target.value)}
                          className="form-input"
                          style={{ maxWidth: '200px', fontSize: '0.85rem', padding: '0.35rem 0.5rem' }}
                        >
                          <option value="">No Group (Single)</option>
                          <option value="Family A">Family A</option>
                          <option value="Family B">Family B</option>
                          <option value="Family C">Family C</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Group overview visual */}
              <div>
                <h4 style={{ color: 'var(--text-heading)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Current Groups Map</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {['Family A', 'Family B', 'Family C'].map(famName => {
                    const members = participantsList.filter(p => activeTrip.accounts?.[p]?.family === famName);
                    if (members.length === 0) return null;
                    return (
                      <div key={famName} className="glass" style={{ padding: '0.75rem 1rem', borderLeft: '4px solid var(--warning)' }}>
                        <div style={{ fontWeight: '700', color: 'var(--warning)', fontSize: '0.85rem', marginBottom: '0.35rem' }}>👨‍👩‍👧‍👦 {famName}</div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {members.map(m => (
                            <span key={m} className="participant-chip" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-heading)', fontSize: '0.75rem' }}>{m}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Single Members */}
                  {(() => {
                    const singles = participantsList.filter(p => {
                      const f = activeTrip.accounts?.[p]?.family;
                      return !f || f.trim() === '';
                    });
                    if (singles.length === 0) return null;
                    return (
                      <div className="glass" style={{ padding: '0.75rem 1rem', borderLeft: '4px solid var(--text-muted)' }}>
                        <div style={{ fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.35rem' }}>👤 Singles (No Family)</div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {singles.map(m => (
                            <span key={m} className="participant-chip" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-heading)', fontSize: '0.75rem' }}>{m}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
            
            <button 
              className="btn-submit" 
              onClick={() => setIsFamilyModalOpen(false)}
              style={{ marginTop: '1.5rem', width: '100%' }}
            >
              Done Organizing
            </button>
          </div>
        </div>
      )}

    {/* Mobile Sticky Bottom Navigation Bar (Rendered outside fade-in to stay fixed to viewport) */}
    <div className="mobile-bottom-nav">
      <button className={`mobile-nav-btn ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentTab('dashboard')}>
        <PieChart size={20} />
        <span>Dashboard</span>
      </button>
      <button className={`mobile-nav-btn ${currentTab === 'expenses' ? 'active' : ''}`} onClick={() => setCurrentTab('expenses')}>
        <DollarSign size={20} />
        <span>Expenses</span>
      </button>
      <button className={`mobile-nav-btn ${currentTab === 'tickets' ? 'active' : ''}`} onClick={() => setCurrentTab('tickets')}>
        <FileText size={20} />
        <span>Tickets</span>
      </button>
      <button className={`mobile-nav-btn ${currentTab === 'map' ? 'active' : ''}`} onClick={() => setCurrentTab('map')}>
        <CalendarDays size={20} />
        <span>Itinerary</span>
      </button>
      <button className={`mobile-nav-btn ${currentTab === 'split' ? 'active' : ''}`} onClick={() => setCurrentTab('split')}>
        <RefreshCw size={20} />
        <span>Settle</span>
      </button>
    </div>

      {/* Ticket Preview Modal */}
      {previewTicket && (
        <div className="modal-overlay" style={{ zIndex: 300 }}>
          <div className="glass modal-content fade-in" style={{ width: '94%', maxWidth: '900px', height: '85vh', display: 'flex', flexDirection: 'column', padding: '1rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
                <FileText size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {previewTicket.name}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <a
                  href={`/tickets/${encodeURIComponent(previewTicket.file)}`}
                  download={previewTicket.name}
                  className="btn-action"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: 'var(--primary)', color: '#fff', borderRadius: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: '600' }}
                >
                  <Download size={13} /> Save File
                </a>
                <button 
                  className="modal-close" 
                  onClick={() => setPreviewTicket(null)}
                  style={{ position: 'static', padding: '0.25rem' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, width: '100%', background: '#fff', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {previewTicket.file.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={`/tickets/${encodeURIComponent(previewTicket.file)}`}
                  title={previewTicket.name}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#334155' }}>
                  <FileText size={48} style={{ margin: '0 auto 1rem', color: '#6366f1' }} />
                  <h4 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>{previewTicket.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
                    Email confirmation (.eml). Tap below to open or download.
                  </p>
                  <a
                    href={`/tickets/${encodeURIComponent(previewTicket.file)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ padding: '0.6rem 1.2rem', background: '#6366f1', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    Open / Download File <Download size={14} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Add Ticket Modal */}
      {isAddTicketModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 300 }}>
          <div className="glass modal-content fade-in">
            <button className="modal-close" onClick={() => setIsAddTicketModalOpen(false)}>
              <X size={20} />
            </button>
            <h3 className="form-title">Add Ticket</h3>
            <form onSubmit={handleAddTicketSubmit} className="form-grid">
              <div className="form-field">
                <label className="form-label">Select Ticket File (PDF / EML / Image)</label>
                <input 
                  type="file" 
                  accept=".pdf,.eml,image/*" 
                  onChange={(evt) => handleTicketSelectFile(evt.target.files[0])}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-label">Ticket Title / Display Name</label>
                <input 
                  type="text" 
                  value={newTicketName} 
                  onChange={(e) => setNewTicketName(e.target.value)} 
                  placeholder="e.g. Flight ticket - Rome to Bangkok" 
                  className="form-input"
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-label">Passengers (ผู้เดินทาง / ผู้ใช้ตั๋ว)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {participantsList.map(p => (
                    <label key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', userSelect: 'none' }}>
                      <input 
                        type="checkbox"
                        checked={newTicketPassengers.includes(p)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewTicketPassengers(prev => [...prev, p]);
                          } else {
                            setNewTicketPassengers(prev => prev.filter(item => item !== p));
                          }
                        }}
                        style={{ cursor: 'pointer', width: '14px', height: '14px' }}
                      />
                      <span>{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-submit">Upload & Save Ticket</button>
            </form>
          </div>
        </div>
      )}

      {/* Bill / Receipt Image/PDF Preview Modal */}
      {previewReceiptUrl && (
        <div className="modal-overlay" style={{ zIndex: 350 }}>
          <div className="glass modal-content fade-in" style={{ width: '94%', maxWidth: '750px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', padding: '1rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                <Receipt size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Bill / Receipt: {previewReceiptUrl.title}
                </h3>
              </div>
              <button className="modal-close" onClick={() => setPreviewReceiptUrl(null)} style={{ position: 'static', padding: '0.25rem' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ flex: 1, width: '100%', overflow: 'auto', background: '#000', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
              {previewReceiptUrl.url.startsWith('data:application/pdf') ? (
                <iframe src={previewReceiptUrl.url} title="Bill PDF" style={{ width: '100%', height: '550px', border: 'none' }} />
              ) : (
                <img src={previewReceiptUrl.url} alt="Bill / Receipt" style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain' }} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
