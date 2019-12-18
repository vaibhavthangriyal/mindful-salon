const express = require('express');
const router = express.Router();
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
// const productRoutes = require('../routes/products/products.route');
// const therapyRoutes = require('./therapy.route');
// const buRoutes = require('./bu.route');

const productRoute = require('./products/product.main.route');
const attendanceRoutes = require("./attendance.route");
const orderRoutes = require("./order.route");
const returnOrderRoutes = require("./return.order.route");
const userRoleRoutes = require('./user_roles.route');
const challanRoutes = require("./challan.route");
const vehicleRoutes = require("./vehicle.route");
const farmVisitRoutes = require("./farm.visit.route");
const subscriptionRoutes = require("./subscription.route");
const notificationRoutes = require("./notification.route");
const customerRoutes = require("./customer.route");
const cartRoutes = require("./cart.route");
const customerOrderRoutes = require("./customer.order.route");
const stateRoutes = require("./state.route");
const bannerRoutes = require("./banner.route");
const routeRoutes = require("./route.route");
const cityRoutes = require("./city.route");
const areaRoutes = require("./area.route");
const ticketRoutes = require("./ticket.route");
const chatRoutes = require("./chat.route");
const eventOrganizerRoutes = require("./event.organizer.route");
const eventTypeRoutes = require("./event.type.route");
const eventLeadRoutes = require("./event.lead.route");
const eventRoutes = require("./event.route");
const paymentRoutes = require("./payment.route");
const vendorRoutes = require("./user/vendor.route");
const callLogRoutes = require("./log/calllog.route");
const reviewRoutes = require("./review/vendor.review.route");
const marketingMaterialRoutes = require("./marketing.material.route");
const imageUploadRoutes = require("./upload.image.route");
const authMiddleware = require("../middleware/authMiddleware");
const validateEnv = require("../middleware/validateEnv");

/** GET /health-check - Check service health */

router.get('/health-check', (req, res) =>
  res.send('OK')
);

router.use('/auth', validateEnv, authRoutes);
router.use('/attendance', validateEnv, authMiddleware, attendanceRoutes);
router.use('/user', validateEnv, authMiddleware, userRoutes);
router.use('/upload', validateEnv, authMiddleware, imageUploadRoutes);
router.use('/state', validateEnv, authMiddleware, stateRoutes);
router.use('/city', validateEnv, authMiddleware, cityRoutes);
router.use('/route', validateEnv, authMiddleware, routeRoutes);
router.use('/area', validateEnv, authMiddleware, areaRoutes);
router.use('/event/organizer', validateEnv, authMiddleware, eventOrganizerRoutes);
router.use('/event/type', validateEnv, authMiddleware, eventTypeRoutes);
router.use('/event/lead', validateEnv, authMiddleware, eventLeadRoutes);
router.use('/event', validateEnv, authMiddleware, eventRoutes);
router.use('/payment', validateEnv, authMiddleware, paymentRoutes);
router.use('/notification', validateEnv, authMiddleware, notificationRoutes);
router.use('/mktmat', validateEnv, authMiddleware, marketingMaterialRoutes);
// router.use('/products', validateEnv, authMiddleware, productRoutes);
// router.use('/pcattribute', validateEnv, authMiddleware, productCategoryAttributeRoutes);
// router.use('/brand', validateEnv, authMiddleware, brandRoutes);
router.use("/order", validateEnv, authMiddleware, orderRoutes);
router.use("/rorder", validateEnv, authMiddleware, returnOrderRoutes);

// Product APIs
router.use('/product', validateEnv, authMiddleware, productRoute);
// router.use('/pcategory', validateEnv, authMiddleware, productCategoryRoutes);
// router.use('/products', validateEnv, authMiddleware, productRoutes);
// router.use('/pcattribute', validateEnv, authMiddleware, productCategoryAttributeRoutes);
// router.use('/ptype', validateEnv, authMiddleware, productTypeRoute);
// router.use('/brand', validateEnv, authMiddleware, brandRoutes);

// VEndor APIs
router.use('/vendor', vendorRoutes);
router.use('/calllog', validateEnv, authMiddleware, callLogRoutes);
router.use('/review', validateEnv, authMiddleware, reviewRoutes);

router.use('/challan', validateEnv, authMiddleware, challanRoutes);
router.use('/banner', validateEnv, authMiddleware, bannerRoutes);
router.use('/subscription', validateEnv, authMiddleware, subscriptionRoutes);
router.use('/support/ticket', validateEnv, authMiddleware, ticketRoutes);
router.use('/support/chat', validateEnv, authMiddleware, chatRoutes);
router.use('/role', userRoleRoutes);
router.use('/fvisit', validateEnv, authMiddleware, farmVisitRoutes);
router.use('/customer', validateEnv, authMiddleware, customerRoutes);
router.use('/cart', validateEnv, authMiddleware, cartRoutes);
router.use('/corder', validateEnv, authMiddleware, customerOrderRoutes);
router.use('/vehicle', validateEnv, authMiddleware, vehicleRoutes);

module.exports = router;
