import jwt, { Secret } from 'jsonwebtoken';



const generateCustomerToken = (id: string, role: string): string => {
    if (!process.env.JWT_CUSTOMER_SECRET) {
        throw new Error("JWT_SECRET is not defined in the environment variables.");
    }
    return jwt.sign({ id, role }, process.env.JWT_CUSTOMER_SECRET as Secret, { expiresIn: "15m" });
};

const generateRefreshCustomerToken = (id: string, role: string): string => {
    if (!process.env.JWT_REFRESH_CUSTOMER_SECRET) {
        throw new Error("JWT_SECRET is not defined in the environment variables.");
    }
    return jwt.sign({ id, role }, process.env.JWT_REFRESH_CUSTOMER_SECRET as Secret, { expiresIn: "3d" });
};


const generateAdminToken = (id: string, role: string): string => {
    if (!process.env.JWT_ADMIN_SECRET) {
        throw new Error("JWT_ADMIN_SECRET is not defined in the environment variables.");
    }
    return jwt.sign({ id, role }, process.env.JWT_ADMIN_SECRET as Secret, { expiresIn: "15m" });
};


const generateRefreshAdminToken = (id: string, role: string): string => {
    if (!process.env.JWT_REFRESH_ADMIN_SECRET) {
        throw new Error("JWT_ADMIN_SECRET is not defined in the environment variables.");
    }
    return jwt.sign({ id, role }, process.env.JWT_REFRESH_ADMIN_SECRET as Secret, { expiresIn: "2d" });
};


const generateVendorToken = (id: string, role: string): string => {
    if (!process.env.JWT_VENDOR_SECRET) {
        throw new Error("JWT_SECRET is not defined in the environment variables.");
    }
    return jwt.sign({ id, role }, process.env.JWT_VENDOR_SECRET as Secret, { expiresIn: "15m" });
};

const generateRefreshVendorToken = (id: string, role: string): string => {
    if (!process.env.JWT_REFRESH_VENDOR_SECRET) {
        throw new Error("JWT_SECRET is not defined in the environment variables.");
    }
    return jwt.sign({ id, role }, process.env.JWT_REFRESH_VENDOR_SECRET as Secret, { expiresIn: "3d" });
};




export { 
    generateCustomerToken,
    generateRefreshCustomerToken, 
    generateAdminToken,
    generateRefreshAdminToken,
    generateVendorToken,
    generateRefreshVendorToken
};
