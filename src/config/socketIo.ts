// src/socket.ts
import { Server } from 'socket.io';
import http from 'http';
import { CustomSocket } from '../interfaces/request.interface';
import ChatRoomService from '../services/chatRoom.service';
import { handleNotification } from '../utils/helperFunctions';
import { NotificationType } from '../utils/eventsVariables';
import { authenticateSocket, validateSocketUser } from '../middlewares/authMiddleware';
import { Icustomer, IcustomerDocument } from '../interfaces/user.interface';
import { IVendorDocument } from '../interfaces/vendor.interface';

const chatroomService =  new ChatRoomService();



let io: Server;
const vendors: Record<string, CustomSocket> = {}; // Mapping vendor IDs to their respective socket connections
const customers: Record<string, CustomSocket> = {}; 

const initializeSocket = (server: http.Server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:4200",
            methods: ["GET", "POST"],
            allowedHeaders: ["authorization"],
            credentials: true,
        }
    });

    io.use(authenticateSocket).on('connection', (socket: CustomSocket) => {
        console.log('User connected with socket id:', socket.id);

        // Join a room
        socket.on('join-room', async({ roomId, customerId }) => {
            try {
                await validateSocketUser(socket);
                socket.roomId = roomId; // Store the room ID
                socket.customerId = customerId; // Store the customerId
                socket.join(roomId);
                customers[customerId] = socket;
                console.log(`Customer ${customerId} joined room ${roomId}`);
            } catch (error: any) {
                handleSocketError(socket, error);
            }
        });

        // Handle offer reception
        socket.on('offer', (data) => {
            try {
                const vendorSocket = vendors[data.vendorId];
                if (vendorSocket) {
                    vendorSocket.emit('receive-offer', { offer: data.offer, roomId: data.roomId });
                } else {
                    socket.emit('error', { message: 'Vendor is not connected' });
                }
            } catch (error: any) {
                handleSocketError(socket, error);
            }
        });

        // Handle answer reception
        socket.on('answer', (data) => {
            try {
                const customerSocket = customers[data.customerId];
                if (customerSocket) {
                    customerSocket.emit('receive-answer', { answer: data.answer, roomId: data.roomId });
                } else {
                    socket.emit('error', { message: 'Customer is not connected' });
                }
            } catch (error: any) {
                handleSocketError(socket, error);
            }
        });

        // Handle end call event
        socket.on('end-call', async({ roomId }) => {
            try {
                await validateSocketUser(socket);

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
            } catch (error: any) {
                handleSocketError(socket, error);
            }
        });

        // Emit call rejection to customer
        socket.on('call-rejected', (data) => {
            try {
                delete customers[data.customerId].roomId;
                socket.to(data.roomId).emit('vendor-call-rejected', { roomId: data.roomId });
            } catch (error: any) {
                handleSocketError(socket, error);
            }
        });

        // Handle ICE candidate
        socket.on('candidate', (data) => {
            try {
                socket.to(data.roomId).emit('receive-candidate', { candidate: data.candidate, senderId: socket.id });
                socket.emit('receive-candidate', { candidate: data.candidate, senderId: socket.id });
            } catch (error: any) {
                handleSocketError(socket, error);
            }
        });

        // Register vendor with socket
        socket.on('register-vendor', (data) => {
            try {
                socket.vendorId = data.vendorId;
                vendors[data.vendorId] = socket;
                io.emit('vendor-online', data.vendorId);
            } catch (error: any) {
                handleSocketError(socket, error);
            }
        });

        // Register customer with socket
        socket.on('register-customer', (data) => {
            try {
                socket.customerId = data.customerId;
                customers[data.customerId] = socket;
                io.emit('customer-online', data.customerId);
            } catch (error: any) {
                handleSocketError(socket, error);
            }
        });

        // Handle outgoing call to a vendor
        socket.on('call_vendor', async(data) => {
            try {
                await validateSocketUser(socket);

                const { vendorId, clientId, offer, roomId, name } = data;
                const vendorSocket = vendors[vendorId];
                if (vendorSocket) {
                    vendorSocket.roomId = roomId; // Store the room ID
                    vendorSocket.join(roomId);
                    vendorSocket.emit('incoming_call', { from: clientId, offer, roomId });

                    const ringingTimeout = setTimeout(async () => {
                        const notification = await handleNotification({ 
                            ...data, userId: vendorId, role: 'vendor', 
                            type: NotificationType.MISSED_CALL, name
                        });
                        vendorSocket.emit('loaded-notification', { notification });
                        socket.emit('call_failed', clientId);
                    }, 30000);

                    vendorSocket.on('answer', () => {
                        clearTimeout(ringingTimeout);
                    });
                } else {
                    socket.emit('vendor_unavailable', vendorId);
                }
            } catch (error: any) {
                handleSocketError(socket, error);
            }
        });

        // Join a chatroom
        socket.on('join-chat-room', async (data) => {
            try {
                await validateSocketUser(socket);
                if(socket.user){
                  const response = await chatroomService.createRoomOrFind(socket.user as (IVendorDocument | IcustomerDocument), data.receiverId)
                  console.log("user is there", !!response, response.id)
                  if (socket.rooms.has(response.id)) {
                      return;
                  }
                  socket.join(response.id);
                  socket.emit('user-joined', { receiverId: data.receiverId, response });
                }
                
            } catch (error: any) {
                handleSocketError(socket, error);
            }
        });

        // Handle message sending
        socket.on('send-message', async (data) => {
            try {
                const { chatRoomId, message } = data;
                const userRole = socket.user?.role || '';
                
                if (socket.rooms.has(chatRoomId) && socket.userId) {
                    const chat = await chatroomService.addNewMessage(socket.userId, message, userRole, chatRoomId);
                    if (chat) {
                        const connectedSockets = io.sockets.adapter.rooms.get(chatRoomId);
                        if (connectedSockets && connectedSockets.size > 1) {
                            socket.to(chatRoomId).emit('new-message', { chat, userRole, message });
                        } else {
                            let receiverSocket;
                            let receiverId = '';
                            if (userRole === 'vendor') {
                                receiverId = chat.customerId.toString();
                                receiverSocket = customers[receiverId];
                            } else if (userRole === 'customer') {
                                receiverId = chat.vendorId.toString();
                                receiverSocket = vendors[receiverId];
                            }

                            if (receiverSocket) {
                                const notification = await handleNotification({ 
                                    ...data, userId: receiverId, role: userRole === 'vendor' ? 'customer' : 'vendor', 
                                    type: NotificationType.MESSAGE, name: data.name 
                                });
                                receiverSocket.emit('loaded-notification', { notification });
                            }
                        }
                        socket.emit('new-message', { chat, userRole, message });
                    }
                }
            } catch (error: any) {
                handleSocketError(socket, error);
            }
        });

        // Save notifications
        socket.on('save-notifications', async (data) => {
            try {
                const notifications = await handleNotification(data);
                if (notifications) {
                    const receiverSocket = data.role === 'vendor' ? vendors[data.userId] : customers[data.userId];
                    if (receiverSocket) {
                        receiverSocket.emit('loaded-notification', { notifications });
                    }
                }
            } catch (error: any) {
                handleSocketError(socket, error);
            }
        });

        // Leave a chatroom
        socket.on('leave-chat-room', async (data) => {
            try {
                await validateSocketUser(socket);
                if (socket.rooms.has(data.chatRoomId)) {
                    socket.leave(data.chatRoomId);
                    socket.emit('user-left', { receiverId: data.receiverId });
                }
            } catch (error: any) {
                handleSocketError(socket, error);
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            if (socket.vendorId) {
                delete vendors[socket.vendorId];
                io.emit('vendor-offline', socket.vendorId);
            } else if (socket.customerId) {
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

// Get instance of Socket.io
const getIO = () => {
  if (!io) {
      throw new Error("Socket.io not initialized. Call 'initializeSocket' first.");
  }
  return io;
};

// Handle and emit socket errors
const handleSocketError = (socket: CustomSocket, error: Error) => {
    console.error('Socket error:', error);
    socket.emit('error', { error });
};




export { initializeSocket, getIO };