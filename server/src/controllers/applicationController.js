const Application = require('../models/Application');

// GET /api/applications
exports.getAll = async (req, res, next) => {
    try {
        const {status, source, search} = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (source) filter.source = source;
        if (search) {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const prefixRegex = new RegExp('^' + escaped, 'i');
            filter.$or = [
                {company: prefixRegex},
                {position: prefixRegex}
            ];
        }

        const applications = await Application.find(filter).sort({updatedAt: -1});
        res.json(applications);
    } catch (error) {
        next(error);
    }
};

// GET /api/applications/:id
exports.getOne = async (req, res, next) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({message: 'Candidature non trouvée'});
        }
        res.json(application);
    } catch (error) {
        next(error);
    }
};

// POST /api/applications
exports.create = async (req, res, next) => {
    try {
        const application = await Application.create(req.body);
        res.status(201).json(application);
    } catch (error) {
        next(error);
    }
};

// PUT /api/applications/:id
exports.update = async (req, res, next) => {
    try {
        const application = await Application.findByIdAndUpdate(
            req.params.id,
            req.body,
            {returnDocument: 'after', runValidators: true}
        );
        if (!application) {
            return res.status(404).json({message: 'Candidature non trouvée'});
        }
        res.json(application);
    } catch (error) {
        next(error);
    }
};

// DELETE /api/applications/:id
exports.remove = async (req, res, next) => {
    try {
        const application = await Application.findByIdAndDelete(req.params.id);
        if (!application) {
            return res.status(404).json({message: 'Candidature non trouvée'});
        }
        res.json({message: 'Candidature supprimée'});
    } catch (error) {
        next(error);
    }
};

// POST /api/applications/:id/timeline — ajouter un événement
exports.addTimelineEvent = async (req, res, next) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({message: 'Candidature non trouvée'});
        }

        application.timeline.push(req.body);

        // Mise à jour auto du statut selon le type d'événement
        const eventType = req.body.type;
        const statusMap = {
            applied: 'applied',
            followup: 'followup',
            phone_screen: 'interview',
            interview_hr: 'interview',
            interview_tech: 'interview',
            test: 'interview',
            offer: 'offer',
            rejected: 'rejected',
            ghosted: 'ghosted'
        };
        if (statusMap[eventType]) {
            application.status = statusMap[eventType];
        }

        await application.save();
        res.json(application);
    } catch (error) {
        next(error);
    }
};

// GET /api/applications/alerts — candidatures à relancer
exports.getAlerts = async (req, res, next) => {
    try {
        const applications = await Application.find({
            status: {$in: ['applied', 'followup']}
        });

        const alerts = applications.filter(app => app.needsFollowup);
        res.json(alerts);
    } catch (error) {
        next(error);
    }
};