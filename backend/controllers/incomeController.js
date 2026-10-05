const incomeService = require('../services/incomeService');

exports.addIncome = async (req, res, next) => {
  try {
    const { amount, description, category } = req.body;

    if (!amount || !description || !category) {
      return res.status(400).json({ message: 'All fields are mandatory' });
    }

    const userId = req.user.id;
    const newIncome = await incomeService.addIncome({ 
      amount,
      description,
      category,
      userId
    });
    res.status(201).json({ newIncomeDetail: newIncome });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.getIncomes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.limit);

    // Handle invalid negative numbers or NaN
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 5;

    // Excessive Limits
    const MAX_LIMIT = 50;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    let offset = (page - 1) * limit;
    
    let { count, rows: incomes } = await incomeService.getIncomes(userId, offset, limit);

    // Out-of-bounds pages
    const totalPages = Math.ceil(count / limit);
    if (page > totalPages && totalPages > 0) {
        page = totalPages;
        offset = (page - 1) * limit;
        const result = await incomeService.getIncomes(userId, offset, limit);
        count = result.count;
        incomes = result.rows;
    }

    res.status(200).json({ 
      allIncomes: incomes,
      totalCount: count,
      currentPage: page,
      totalPages: totalPages
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.deleteIncome = async (req, res, next) => {
  try {
    const incomeId = req.params.id;
    const userId = req.user.id; 
    
    if (!incomeId) {
      return res.status(400).json({ message: 'Income ID is missing' });
    }
    await incomeService.deleteIncome(incomeId, userId);
    res.status(200).json({ message: 'Income successfully deleted' });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.updateIncome = async (req, res, next) => {
  try {
    const incomeId = req.params.id;
    const userId = req.user.id;
    const { amount, description, category } = req.body;
    
    if (!amount || !description || !category) {
      return res.status(400).json({ message: 'All fields are mandatory' });
    }

    await incomeService.updateIncome(incomeId, { amount, description, category }, userId);
    res.status(200).json({ message: 'Income successfully updated' });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
