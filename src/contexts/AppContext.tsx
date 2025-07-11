import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
    en: {
        add: "Add", edit: "Edit", delete: "Delete", save: "Save", cancel: "Cancel", name: "Name", value: "Value", category: "Category", date: "Date",
        dashboard: "Dashboard", spending: "Spending", expenses: "Expenses", budgets: "Budgets", cashFlow: "Cash Flow", netWorth: "Net Worth", assets: "Assets", lended: "Lended", liabilities: "Liabilities", planning: "Planning", family: "Family", goals: "Goals",
        personalOverview: "Personal Overview", familyOverview: "Family Overview", totalAssets: "Total Assets", totalLiabilities: "Total Liabilities", thisMonthsSpending: "This Month's Spending", assetsVsLiabilities: "Assets vs. Liabilities Breakdown", quickActions: "Quick Actions", addExpense: "Add Expense",
        addNew: "Add New", editItem: "Edit", ownershipType: "Ownership Type", soleOwnership: "Sole Ownership", partialOwnership: "Partial Ownership", allocateOwnership: "Allocate Ownership", total: "Total", self: "Self",
        myAssets: "My Assets", myLiabilities: "My Liabilities", lendedCash: "Lended Cash", manageFamily: "Manage Family", myGoals: "My Goals", monthlyBudgets: "Monthly Budgets", allExpenses: "All Expenses", monthlyCashFlow: "Monthly Cash Flow",
        addLoan: "Add Loan", addMember: "Add Member", addGoal: "Add Goal", newBudget: "New Budget", logExpense: "Log Expense", totalIncome: "Total Income", netSavings: "Net Savings", spendingByCategory: "Spending by Category", budgetPerformance: "Budget Performance",
    },
    te: {
        add: "జోడించు", edit: "సవరించు", delete: "తొలగించు", save: "సేవ్ చేయి", cancel: "రద్దు చేయి", name: "పేరు", value: "విలువ", category: "వర్గం", date: "తేదీ",
        dashboard: "డాష్‌బోర్డ్", spending: "ఖర్చులు", expenses: "వ్యయాలు", budgets: "బడ్జెట్లు", cashFlow: "నగదు ప్రవాహం", netWorth: "నికర విలువ", assets: "ఆస్తులు", lended: "అప్పు ఇచ్చింది", liabilities: "అప్పులు", planning: "ప్రణాళిక", family: "కుటుంబం", goals: "లక్ష్యాలు",
        personalOverview: "వ్యక్తిగత అవలోకనం", familyOverview: "కుటుంబ అవలోకనం", totalAssets: "మొత్తం ఆస్తులు", totalLiabilities: "మొత్తం అప్పులు", thisMonthsSpending: "ఈ నెల ఖర్చు", assetsVsLiabilities: "ఆస్తులు వర్సెస్ అప్పుల విచ్ఛిన్నం", quickActions: "త్వరిత చర్యలు", addExpense: "వ్యయం జోడించు",
        addNew: "కొత్తగా జోడించు", editItem: "సవరించు", ownershipType: "యాజమాన్య రకం", soleOwnership: "ఏకైక యాజమాన్యం", partialOwnership: "పాక్షిక యాజమాన్యం", allocateOwnership: "యాజమాన్యం కేటాయించు", total: "మొత్తం", self: "స్వయం",
        myAssets: "నా ఆస్తులు", myLiabilities: "నా అప్పులు", lendedCash: "ఇచ్చిన అప్పు", manageFamily: "కుటుంబాన్ని నిర్వహించు", myGoals: "నా లక్ష్యాలు", monthlyBudgets: "నెలవారీ బడ్జెట్లు", allExpenses: "అన్ని వ్యయాలు", monthlyCashFlow: "నెలవారీ నగదు ప్రవాహం",
        addLoan: "అప్పు జోడించు", addMember: "సభ్యుడిని జోడించు", addGoal: "లక్ష్యం జోడించు", newBudget: "కొత్త బడ్జెట్", logExpense: "వ్యయం లాగ్ చేయి", totalIncome: "మొత్తం ఆదాయం", netSavings: "నికర పొదుపు", spendingByCategory: "వర్గం ప్రకారం ఖర్చు", budgetPerformance: "బడ్జెట్ పనితీరు",
    }
};

interface AppContextType {
    t: (key: string) => string;
    theme: string;
    setTheme: (theme: string) => void;
    language: string;
    setLanguage: (language: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [theme, setTheme] = useState(localStorage.getItem('folio-theme') || 'dark');
    const [language, setLanguage] = useState(localStorage.getItem('folio-language') || 'en');

    useEffect(() => {
        if(theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('folio-theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('folio-language', language);
    }, [language]);

    const t = (key: string): string => {
        return translations[language as keyof typeof translations][key as keyof typeof translations['en']] || key;
    };

    const contextValue = { t, theme, setTheme, language, setLanguage };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
