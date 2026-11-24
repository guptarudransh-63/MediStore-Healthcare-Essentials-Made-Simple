import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { InventoryBatch } from '../models/InventoryBatch.js';
import { Prescription } from '../models/Prescription.js';
import { getExpiryAnalysis } from '../services/expiryService.js';

export const getDashboardKPIs = async (req, res, next) => {
  try {
    const now = new Date();
    const expiryAnalysis = await getExpiryAnalysis();

    // Valid completed/in-progress orders (exclude cancelled & rejected)
    const validOrders = await Order.find({
      orderStatus: { $nin: ['cancelled', 'rejected'] }
    });

    const totalSales = validOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const totalOrdersCount = await Order.countDocuments();
    const averageOrderValue = validOrders.length > 0 ? totalSales / validOrders.length : 0;

    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const pendingPrescriptions = await Prescription.countDocuments({ status: 'pending_review' });

    const pendingOrders = await Order.countDocuments({
      orderStatus: { $in: ['order_placed', 'pending_prescription_review', 'confirmed', 'processing', 'packed'] }
    });

    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    const lowStockCount = await Product.countDocuments({
      isPublished: true,
      $expr: { $lte: ['$totalAvailableStock', '$reorderThreshold'] }
    });

    res.json({
      success: true,
      kpis: {
        totalSales: Number(totalSales.toFixed(2)),
        totalOrders: totalOrdersCount,
        validOrdersCount: validOrders.length,
        averageOrderValue: Number(averageOrderValue.toFixed(2)),
        totalCustomers,
        pendingOrders,
        deliveredOrders,
        pendingPrescriptions,
        lowStockCount,
        expiredBatchesCount: expiryAnalysis.summary.expiredCount,
        nearExpiryUnits: expiryAnalysis.summary.within30DaysUnits,
        nearExpiryValue: Number(expiryAnalysis.summary.nearExpiryValue.toFixed(2)),
        totalValueAtRisk: Number(expiryAnalysis.summary.totalValueAtRisk.toFixed(2))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSalesAnalytics = async (req, res, next) => {
  try {
    const { timeRange = '30d' } = req.query; // '7d', '30d', '90d', 'all'

    const now = new Date();
    let startDate = new Date();

    if (timeRange === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else if (timeRange === '90d') {
      startDate.setDate(now.getDate() - 90);
    } else {
      startDate = new Date(0); // all time
    }

    const orders = await Order.find({
      createdAt: { $gte: startDate },
      orderStatus: { $nin: ['cancelled', 'rejected'] }
    }).populate('items.product', 'category manufacturer').sort({ createdAt: 1 });

    // Group revenue & orders by day
    const dateMap = {};
    const categoryMap = {};
    const productSalesMap = {};
    const manufacturerMap = {};
    const paymentMethodMap = { cash_on_delivery: 0, upi: 0, card: 0, net_banking: 0 };
    const orderStatusMap = {};

    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { date: dateKey, revenue: 0, orders: 0 };
      }
      dateMap[dateKey].revenue += order.grandTotal;
      dateMap[dateKey].orders += 1;

      // Payment method
      if (order.paymentMethod) {
        paymentMethodMap[order.paymentMethod] = (paymentMethodMap[order.paymentMethod] || 0) + 1;
      }

      // Order status
      orderStatusMap[order.orderStatus] = (orderStatusMap[order.orderStatus] || 0) + 1;

      // Product sales & category
      for (const item of order.items) {
        const prodName = item.productName || 'Unknown Product';
        if (!productSalesMap[prodName]) {
          productSalesMap[prodName] = { name: prodName, units: 0, revenue: 0 };
        }
        productSalesMap[prodName].units += item.quantity;
        productSalesMap[prodName].revenue += item.totalAmount;

        const mfg = item.product?.manufacturer || 'Generic Pharma';
        manufacturerMap[mfg] = (manufacturerMap[mfg] || 0) + item.totalAmount;
      }
    }

    const revenueOverTime = Object.values(dateMap).map(d => ({
      ...d,
      revenue: Number(d.revenue.toFixed(2))
    }));

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 7)
      .map(p => ({ ...p, revenue: Number(p.revenue.toFixed(2)) }));

    const topManufacturers = Object.entries(manufacturerMap)
      .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const paymentMethods = Object.entries(paymentMethodMap).map(([name, count]) => ({
      name: name === 'cash_on_delivery' ? 'Cash on Delivery' : name.toUpperCase(),
      count
    }));

    // All order statuses count (including cancelled)
    const allOrders = await Order.find({ createdAt: { $gte: startDate } });
    const allStatuses = {};
    for (const o of allOrders) {
      allStatuses[o.orderStatus] = (allStatuses[o.orderStatus] || 0) + 1;
    }

    const orderStatusDistribution = Object.entries(allStatuses).map(([status, count]) => ({
      status: status.replace(/_/g, ' ').toUpperCase(),
      count
    }));

    res.json({
      success: true,
      timeRange,
      analytics: {
        revenueOverTime,
        topProducts,
        topManufacturers,
        paymentMethods,
        orderStatusDistribution
      }
    });
  } catch (error) {
    next(error);
  }
};
