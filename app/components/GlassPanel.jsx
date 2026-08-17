export const GlassPanel = ({ children, className = "" }) => {
    return (
        <div className={`glass-panel overflow-hidden ${className}`}>
            {children}
        </div>
    );
};
