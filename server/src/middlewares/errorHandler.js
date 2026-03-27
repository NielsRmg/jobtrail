const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ message: 'Erreur de validation', errors: messages });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({ message: 'ID invalide' });
    }

    res.status(500).json({ message: 'Erreur serveur' });
};

module.exports = errorHandler;