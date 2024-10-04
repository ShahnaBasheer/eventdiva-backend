"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initializeSocket = void 0;
// src/socket.ts
const socket_io_1 = require("socket.io");
const chatRoom_service_1 = __importDefault(require("../services/chatRoom.service"));
const helperFunctions_1 = require("../utils/helperFunctions");
const eventsVariables_1 = require("../utils/eventsVariables");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const important_variables_1 = require("../utils/important-variables");
const chatroomService = new chatRoom_service_1.default();
let io;
const vendors = {}; // Mapping vendor IDs to their respective socket connections
const customers = {};
const initializeSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: [
                process.env.LOCALHOST_URL || '',
                process.env.FRONTEND_AMPLIFY_URL || '',
                process.env.FRONTEND_URL || '',
                process.env.FRONTEND_WWW_URL || '',
            ],
            methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
            allowedHeaders: ["authorization"],
            credentials: true,
        }
    });
    io.use(authMiddleware_1.authenticateSocket).on('connection', (socket) => {
        console.log('User connected with socket id:', socket.id);
        // Join a room
        socket.on('join-room', (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomId, customerId }) {
            try {
                yield (0, authMiddleware_1.validateSocketUser)(socket);
                socket.roomId = roomId; // Store the room ID
                socket.customerId = customerId; // Store the customerId
                socket.join(roomId);
                customers[customerId] = socket;
                console.log(`Customer ${customerId} joined room ${roomId}`);
            }
            catch (error) {
                handleSocketError(socket, error);
            }
        }));
        // Handle offer reception
        socket.on('offer', (data) => {
            try {
                const vendorSocket = vendors[data.vendorId];
                if (vendorSocket) {
                    vendorSocket.emit('receive-offer', { offer: data.offer, roomId: data.roomId });
                }
                else {
                    socket.emit('error', { message: 'Vendor is not connected' });
                }
            }
            catch (error) {
                handleSocketError(socket, error);
            }
        });
        // Handle answer reception
        socket.on('answer', (data) => {
            try {
                const customerSocket = customers[data.customerId];
                if (customerSocket) {
                    customerSocket.emit('receive-answer', { answer: data.answer, roomId: data.roomId });
                }
                else {
                    socket.emit('error', { message: 'Customer is not connected' });
                }
            }
            catch (error) {
                handleSocketError(socket, error);
            }
        });
        // Handle end call event
        socket.on('end-call', (_b) => __awaiter(void 0, [_b], void 0, function* ({ roomId }) {
            try {
                yield (0, authMiddleware_1.validateSocketUser)(socket);
                if (socket.customerId && customers[socket.customerId]) {
                    if (customers[socket.customerId].roomId === roomId) {
                        delete customers[socket.customerId].roomId;
                    }
                }
                if (socket.vendorId && vendors[socket.vendorId]) {
                    if (vendors[socket.vendorId].roomId === roomId) {
                        delete vendors[socket.vendorId].roomId;
                    }
                }
                socket.leave(roomId);
                socket.to(roomId).emit('callEnded', { roomId });
            }
            catch (error) {
                handleSocketError(socket, error);
            }
        }));
        // Emit call rejection to customer
        socket.on('call-rejected', (data) => {
            try {
                delete customers[data.customerId].roomId;
                socket.to(data.roomId).emit('vendor-call-rejected', { roomId: data.roomId });
            }
            catch (error) {
                handleSocketError(socket, error);
            }
        });
        // Handle ICE candidate
        socket.on('candidate', (data) => {
            try {
                socket.to(data.roomId).emit('receive-candidate', { candidate: data.candidate, senderId: socket.id });
                socket.emit('receive-candidate', { candidate: data.candidate, senderId: socket.id });
            }
            catch (error) {
                handleSocketError(socket, error);
            }
        });
        // Register vendor with socket
        socket.on('register-vendor', (data) => {
            try {
                socket.vendorId = data.vendorId;
                vendors[data.vendorId] = socket;
                io.emit('vendor-online', data.vendorId);
            }
            catch (error) {
                handleSocketError(socket, error);
            }
        });
        // Register customer with socket
        socket.on('register-customer', (data) => {
            try {
                socket.customerId = data.customerId;
                customers[data.customerId] = socket;
                io.emit('customer-online', data.customerId);
            }
            catch (error) {
                handleSocketError(socket, error);
            }
        });
        // Handle outgoing call to a vendor
        socket.on('call_vendor', (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield (0, authMiddleware_1.validateSocketUser)(socket);
                const { vendorId, clientId, offer, roomId, name } = data;
                const vendorSocket = vendors[vendorId];
                if (vendorSocket) {
                    vendorSocket.roomId = roomId; // Store the room ID
                    vendorSocket.join(roomId);
                    vendorSocket.emit('incoming_call', { from: clientId, offer, roomId });
                    const ringingTimeout = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                        const notification = yield (0, helperFunctions_1.handleNotification)(Object.assign(Object.assign({}, data), { userId: vendorId, role: 'vendor', type: eventsVariables_1.NotificationType.MISSED_CALL, name }));
                        vendorSocket.emit('loaded-notification', { notification });
                        socket.emit('call_failed', clientId);
                    }), 30000);
                    vendorSocket.on('answer', () => {
                        clearTimeout(ringingTimeout);
                    });
                }
                else {
                    socket.emit('vendor_unavailable', vendorId);
                }
            }
            catch (error) {
                handleSocketError(socket, error);
            }
        }));
        // Join a chatroom
        socket.on('join-chat-room', (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield (0, authMiddleware_1.validateSocketUser)(socket);
                if (socket.user) {
                    const response = yield chatroomService.createRoomOrFind(socket.user, data.receiverId);
                    console.log("user is there", !!response, response.id);
                    if (socket.rooms.has(response.id)) {
                        return;
                    }
                    socket.join(response.id);
                    socket.emit('user-joined', { receiverId: data.receiverId, response });
                }
            }
            catch (error) {
                handleSocketError(socket, error);
            }
        }));
        // Handle message sending
        socket.on('send-message', (data) => __awaiter(void 0, void 0, void 0, function* () {
            var _c;
            try {
                const { chatRoomId, message, name } = data;
                const userRole = ((_c = socket.user) === null || _c === void 0 ? void 0 : _c.role) || '';
                if (socket.rooms.has(chatRoomId) && socket.user) {
                    const chat = yield chatroomService.addNewMessage(socket.user.id, message, userRole, chatRoomId);
                    if (chat) {
                        const connectedSockets = io.sockets.adapter.rooms.get(chatRoomId);
                        if (connectedSockets && connectedSockets.size > 1) {
                            socket.to(chatRoomId).emit('new-message', { chat, userRole, message });
                        }
                        else {
                            let receiverSocket;
                            let receiverId = '';
                            if (userRole === 'vendor') {
                                receiverId = chat.customerId.toString();
                                receiverSocket = customers[receiverId];
                            }
                            else if (userRole === 'customer') {
                                receiverId = chat.vendorId.toString();
                                receiverSocket = vendors[receiverId];
                            }
                            if (receiverSocket) {
                                const notification = yield (0, helperFunctions_1.handleNotification)(Object.assign(Object.assign({}, data), { userId: receiverId, role: userRole === important_variables_1.UserRole.Vendor ? important_variables_1.UserRole.Customer : important_variables_1.UserRole.Vendor, type: eventsVariables_1.NotificationType.MESSAGE, name: data.name }));
                                receiverSocket.emit('loaded-notification', { notification });
                            }
                        }
                        socket.emit('new-message', { chat, userRole, message });
                    }
                }
            }
            catch (error) {
                handleSocketError(socket, error);
            }
        }));
        // Save notifications
        socket.on('save-notifications', (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log("save notification is triggered", socket);
                const notification = yield (0, helperFunctions_1.handleNotification)(data);
                if (notification) {
                    const receiverSocket = data.role === important_variables_1.UserRole.Vendor ? vendors[data.userId] : customers[data.userId];
                    if (receiverSocket) {
                        receiverSocket.emit('loaded-notification', { notification });
                    }
                }
            }
            catch (error) {
                handleSocketError(socket, error);
            }
        }));
        // Leave a chatroom
        socket.on('leave-chat-room', (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield (0, authMiddleware_1.validateSocketUser)(socket);
                if (socket.rooms.has(data.chatRoomId)) {
                    socket.leave(data.chatRoomId);
                    socket.emit('user-left', { receiverId: data.receiverId });
                }
            }
            catch (error) {
                handleSocketError(socket, error);
            }
        }));
        // Handle disconnection
        socket.on('disconnect', () => {
            if (socket.vendorId) {
                delete vendors[socket.vendorId];
                io.emit('vendor-offline', socket.vendorId);
            }
            else if (socket.customerId) {
                delete customers[socket.customerId];
                io.emit('customer-offline', socket.customerId);
            }
            console.log('User disconnected:', socket.id);
        });
    });
    // Global error handler for unhandled errors
    io.on('error', (error) => {
        console.error('Socket.io error:', error);
    });
};
exports.initializeSocket = initializeSocket;
// Get instance of Socket.io
const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized. Call 'initializeSocket' first.");
    }
    return io;
};
exports.getIO = getIO;
// Handle and emit socket errors
const handleSocketError = (socket, error) => {
    console.error('Socket error:', error);
    socket.emit('error', { error });
};
