

interface mailOption {
    from: string, 
    to: string, 
    subject: string, 
    text: string
}
interface Filter {
    [key: string]: any; // This allows any key-value pairs for filtering
}

export {
    mailOption,
    Filter
}