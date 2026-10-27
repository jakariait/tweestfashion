const { checkCourierByPhone } = require('../services/courierService');
const orderService = require('../services/orderService');
const steadfastService = require('../services/steadfastService');
const pathaoService = require('../services/pathaoService');

const handleCourierCheck = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  try {
    const result = await checkCourierByPhone(phone);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Courier check failed', error });
  }
};

const getDynamicCourierStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderService.getOrderById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.sentToCourier) {
      return res.status(400).json({ message: 'Order has not been sent to a courier yet.' });
    }

    let status;

    if (order.courierProvider === 'steadfast') {
      status = await steadfastService.getSteadfastOrderStatusByInvoiceService(order.orderNo);
    } else if (order.courierProvider === 'pathao') {
      if (!order.courierConsignmentId) {
        return res.status(400).json({ message: 'Pathao consignment ID not found for this order.' });
      }
      status = await pathaoService.getPathaoOrderStatus(order.courierConsignmentId);
    } else {
      return res.status(400).json({ message: 'No valid courier provider found for this order.' });
    }

    res.status(200).json({ status: 'success', data: status });
  } catch (error) {
    console.error('Error fetching dynamic courier status:', error);
    res.status(500).json({ message: 'Failed to fetch courier status', error: error.message });
  }
};

module.exports = { handleCourierCheck, getDynamicCourierStatus };
