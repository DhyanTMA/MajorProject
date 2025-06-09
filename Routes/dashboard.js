const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Bill = require('../models/Bill');

const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
};

router.get('/dashboard-data', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        
        const transactions = await Transaction.find({ userId }).sort({ date: -1 });
        
        const upcomingBills = await Bill.find({ 
            userId, 
            isPaid: false,
            dueDate: { $gte: new Date() }
        }).sort({ dueDate: 1 }).limit(5);
        
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);
        
        const monthlyTransactions = transactions.filter(t => new Date(t.date) >= currentMonth);
        
        const totalIncome = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpenses = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const netProfit = totalIncome - totalExpenses;
        
        const expensesByCategory = {};
        monthlyTransactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
            });
            
        const categoryBreakdown = Object.entries(expensesByCategory)
            .map(([category, amount]) => ({
                category,
                amount,
                percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 3);
        
        const recentTransactions = transactions.slice(0, 5);
        
        res.json({
            stats: {
                totalIncome: totalIncome.toFixed(2),
                totalExpenses: totalExpenses.toFixed(2),
                netProfit: netProfit.toFixed(2),
                budgetRemaining: Math.max(0, 5000 - totalExpenses).toFixed(2) // Assuming $5000 monthly budget
            },
            recentTransactions,
            categoryBreakdown,
            upcomingBills
        });
        
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/add-transaction', requireAuth, async (req, res) => {
    try {
        const { type, amount, description, category } = req.body;
        
        const transaction = new Transaction({
            userId: req.session.userId,
            type,
            amount: parseFloat(amount),
            description,
            category
        });
        
        await transaction.save();
        res.json({ success: true, transaction });
        
    } catch (error) {
        console.error('Add transaction error:', error);
        res.status(500).json({ error: 'Failed to add transaction' });
    }
});

router.post('/add-bill', requireAuth, async (req, res) => {
    try {
        const { name, amount, dueDate, category } = req.body;
        
        const bill = new Bill({
            userId: req.session.userId,
            name,
            amount: parseFloat(amount),
            dueDate: new Date(dueDate),
            category: category || 'General'
        });
        
        await bill.save();
        res.json({ success: true, bill });
        
    } catch (error) {
        console.error('Add bill error:', error);
        res.status(500).json({ error: 'Failed to add bill' });
    }
});

module.exports = router;