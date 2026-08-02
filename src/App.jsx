import { useState, useEffect } from 'react';
import { initialTrips } from './data/trips';
import { 
  Compass, 
  Plus, 
  Calendar, 
  Users, 
  DollarSign, 
  FileText, 
  Folder, 
  FolderOpen, 
  Map, 
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
  Moon
} from 'lucide-react';
import './App.css';

function App() {
  // Load trips from localStorage or use initialTrips
  const [trips, setTrips] = useState(() => {
    const saved = localStorage.getItem('monitoring_trips_v7');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse trips", e);
      }
    }
    return initialTrips;
  });

  const [copiedId, setCopiedId] = useState(null);

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Save trips to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('monitoring_trips_v7', JSON.stringify(trips));
  }, [trips]);

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
            <Map size={16} /> Map Route
          </button>
          <button className={`nav-btn ${currentTab === 'split' ? 'active' : ''}`} onClick={() => setCurrentTab('split')}>
            <RefreshCw size={16} /> Settle Debts
          </button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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

      {/* Mobile Sticky Bottom Navigation Bar */}
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
          <Map size={20} />
          <span>Map</span>
        </button>
        <button className={`mobile-nav-btn ${currentTab === 'split' ? 'active' : ''}`} onClick={() => setCurrentTab('split')}>
          <RefreshCw size={20} />
          <span>Settle</span>
        </button>
      </div>

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
            <button className="btn-action btn-action-primary" onClick={() => setIsExpenseModalOpen(true)}>
              <Plus size={18} /> Register Expense
            </button>
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
                          <button 
                            onClick={() => openEditExpenseModal(e)} 
                            className="btn-action" 
                            style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                          >
                            <Edit2 size={12} /> Edit
                          </button>
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
                      
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Paid by: {e.paidBy || 'Thitiwut'}</span>
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
                        <a 
                          href={`/tickets/${t.file}`} 
                          download={t.name}
                          className="ticket-download-link"
                        >
                          <Download size={14} /> Download File
                        </a>
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

        {/* Map Route representation */}
        {currentTab === 'map' && (
          <div className="glass map-card fade-in">
            <h2 style={{ color: 'var(--text-heading)', marginBottom: '1rem' }}>Trip Geographical Milestones</h2>
            <div className="map-container">
              
              {/* Left Panel: SVG Map visual route */}
              <div className="map-svg-col">
                <svg className="map-svg" viewBox="0 0 300 500">
                  <path 
                    d="M50 80 Q90 90 120 70 T160 50 T220 50 T240 70 L240 100 Q190 120 180 160 T190 230 T220 280 T260 310 L280 340 L260 380 L230 350 L200 400 L180 430 L160 480 L140 480 L145 440 L160 410 Q140 370 130 350 T130 280 T150 200 Q120 180 90 180 T70 140 T50 80 Z" 
                    fill="#1e293b" 
                    stroke="rgba(255,255,255,0.1)" 
                    strokeWidth="1.5"
                  />
                  
                  <path 
                    d={`M ${mapNodes.map(node => `${node.x} ${node.y}`).join(' L ')}`} 
                    className="map-route-line"
                  />
                  
                  {mapNodes.map((node, index) => (
                    <g 
                      key={index} 
                      className="map-pin" 
                      onClick={() => setSelectedMapNode(index)}
                    >
                      <circle 
                        cx={node.x} 
                        cy={node.y} 
                        r={selectedMapNode === index ? 8 : 5} 
                        fill={selectedMapNode === index ? "#ef4444" : "#6366f1"}
                        className={selectedMapNode === index ? "animate-pulse" : ""}
                      />
                      <text 
                        x={node.x + 8} 
                        y={node.y + 4} 
                        fill={selectedMapNode === index ? "#fff" : "var(--text-muted)"}
                        fontSize={selectedMapNode === index ? "8" : "6"}
                        fontWeight={selectedMapNode === index ? "700" : "500"}
                      >
                        {node.city}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              {/* Right Panel: Selected node details */}
              <div className="map-info-col">
                <div className="map-info-title">{mapNodes[selectedMapNode].city}</div>
                <div className="map-info-sub">Itinerary Date: {mapNodes[selectedMapNode].date}</div>
                <div className="participant-chip" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '1.5rem', display: 'inline-block' }}>
                  {mapNodes[selectedMapNode].desc}
                </div>
                
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <h4 style={{ color: 'var(--text-heading)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Itinerary Logistics & Budgets</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    {mapNodes[selectedMapNode].notes}
                  </p>
                </div>

                <div style={{ marginTop: '2rem' }}>
                  <div className="sidebar-title" style={{ paddingLeft: 0 }}>Route Stops Overview</div>
                  <div className="map-timeline">
                    {mapNodes.map((node, index) => (
                      <div 
                        key={index} 
                        className={`timeline-node ${selectedMapNode === index ? 'active' : ''}`}
                        onClick={() => setSelectedMapNode(index)}
                      >
                        <span className="timeline-bullet"></span>
                        <div className="timeline-place">{node.city}</div>
                        <div className="timeline-details">{node.date} • {node.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Debt settlement calculator panel */}
        {currentTab === 'split' && (
          <div className="reimbursement-layout fade-in">
            {/* Left Column: Settlement Actions */}
            <div className="glass calculator-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ color: 'var(--text-heading)', marginBottom: '0.25rem' }}>Reimbursement Payments</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
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
                        <div>
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
                  return (
                    <div key={p} className="account-setup-card">
                      <div style={{ fontWeight: '700', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                        <CreditCard size={14} style={{ color: 'var(--primary)' }} />
                        {p}'s Account
                      </div>
                      
                      <div className="account-form-grid">
                        <input 
                          type="text" 
                          placeholder="Bank Name (e.g. KBank)" 
                          value={acc?.bankName || ''} 
                          onChange={(e) => handleUpdateBankDetails(p, 'bankName', e.target.value)}
                          className="form-input"
                          style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                        />
                        <input 
                          type="text" 
                          placeholder="Account Number" 
                          value={acc?.accountNumber || ''} 
                          onChange={(e) => handleUpdateBankDetails(p, 'accountNumber', e.target.value)}
                          className="form-input"
                          style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                        />
                        <input 
                          type="text" 
                          placeholder="Account Owner Name (ชื่อเจ้าของบัญชี)" 
                          value={acc?.accountName || ''} 
                          onChange={(e) => handleUpdateBankDetails(p, 'accountName', e.target.value)}
                          className="form-input"
                          style={{ fontSize: '0.8rem', padding: '0.4rem', gridColumn: 'span 2' }}
                        />
                        <input 
                          type="text" 
                          placeholder="Family Group (e.g. Family A)" 
                          value={acc?.family || ''} 
                          onChange={(e) => handleUpdateBankDetails(p, 'family', e.target.value)}
                          className="form-input"
                          style={{ fontSize: '0.8rem', padding: '0.4rem', gridColumn: 'span 2', borderLeft: '3px solid var(--warning)' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

              <button type="submit" className="btn-submit">Save Changes</button>
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
    </div>
  );
}

export default App;
