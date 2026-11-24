import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Prescription } from '../models/Prescription.js';

export const getCustomers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = { role: 'customer' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Aggregate spending and order counts
    const customersWithStats = await Promise.all(
      users.map(async (u) => {
        const orders = await Order.find({ customer: u._id, orderStatus: { $ne: 'cancelled' } });
        const totalSpent = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
        const lastOrder = orders.length ? orders[orders.length - 1] : null;

        return {
          ...u.toObject(),
          totalOrders: orders.length,
          totalSpent: Number(totalSpent.toFixed(2)),
          lastOrderDate: lastOrder ? lastOrder.createdAt : null
        };
      })
    );

    res.json({
      success: true,
      count: customersWithStats.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      customers: customersWithStats
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerProfile = async (req, res, next) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const [orders, prescriptions] = await Promise.all([
      Order.find({ customer: customer._id }).sort({ createdAt: -1 }),
      Prescription.find({ customer: customer._id }).sort({ createdAt: -1 })
    ]);

    const totalSpent = orders
      .filter(o => o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    res.json({
      success: true,
      customer,
      stats: {
        totalOrders: orders.length,
        totalSpent: Number(totalSpent.toFixed(2)),
        prescriptionsCount: prescriptions.length
      },
      orders,
      prescriptions
    });
  } catch (error) {
    next(error);
  }
};
