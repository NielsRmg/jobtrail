const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    company:      { type: String, required: [true, "Le nom de l'entreprise est requis"], trim: true },
    position:     { type: String, required: [true, "L'intitulé du poste est requis"], trim: true },
    url:          { type: String, trim: true },
    location: {
        city:       { type: String, trim: true },
        remote:     { type: Boolean, default: false }
    },
    contractType: { type: String, enum: ['CDI', 'CDD', 'Freelance', 'Stage', 'Alternance'] },
    salary: {
        min:        { type: Number },
        max:        { type: Number },
        currency:   { type: String, default: 'EUR' }
    },
    source:       { type: String, enum: ['LinkedIn', 'Indeed', 'HelloWork', 'WelcomeToTheJungle', 'Direct', 'Cooptation', 'Salon', 'Autre'] },
    status:       { type: String, enum: ['wishlist', 'applied', 'followup', 'interview', 'offer', 'accepted', 'rejected', 'ghosted'], default: 'wishlist' },
    appliedAt:    { type: Date },
    followupDate: { type: Date },
    tags:         [{ type: String, trim: true }],
    contacts: [{
        name:       { type: String, required: true, trim: true },
        role:       { type: String, trim: true },
        email:      { type: String, trim: true, match: [/^\S+@\S+\.\S+$/, "Format d'email invalide"] },
        phone:      { type: String, trim: true },
        linkedin:   { type: String, trim: true }
    }],
    timeline: [{
        date:       { type: Date, default: Date.now },
        type:       { type: String, enum: ['applied', 'followup', 'phone_screen', 'interview_hr', 'interview_tech', 'test', 'offer', 'rejected', 'ghosted'], required: true },
        note:       { type: String, trim: true }
    }],
    attachments: [{
        filename:   { type: String, required: true },
        path:       { type: String, required: true },
        type:       { type: String, enum: ['response_email', 'cv_sent', 'job_description', 'other'], default: 'other' },
        addedAt:    { type: Date, default: Date.now }
    }],
    notes:        { type: String, trim: true }
}, { timestamps: true });

// const applicationSchema = new mongoose.Schema({
//     company: {
//         type: String,
//         required: [true, "Le nom de l'entreprise est requis"],
//         trim: true
//     },
//     position: {
//         type: String,
//         required: [true, "L'intitulé du poste est requis"],
//         trim: true
//     },
//     url: {
//         type: String,
//         trim: true
//     },
//     location: {
//         city: {type: String, trim: true},
//         remote: {type: Boolean, default: false}
//     },
//     contractType: {
//         type: String,
//         enum: ['CDI', 'CDD', 'Freelance', 'Stage', 'Alternance']
//     },
//     salary: {
//         min: {type: Number},
//         max: {type: Number},
//         currency: {type: String, default: 'EUR'}
//     },
//     source: {
//         type: String,
//         enum: ['LinkedIn', 'Indeed', 'HelloWork', 'WelcomeToTheJungle', 'Direct', 'Cooptation', 'Salon', 'Autre']
//     },
//     status: {
//         type: String,
//         enum: ['wishlist', 'applied', 'followup', 'interview', 'offer', 'accepted', 'rejected', 'ghosted'],
//         default: 'wishlist'
//     },
//     appliedAt: {
//         type: Date
//     },
//     followupDate: {
//         type: Date
//     },
//     tags: [{
//         type: String,
//         trim: true
//     }],
//     contacts: [{
//         name: {type: String, required: true, trim: true},
//         role: {type: String, trim: true},
//         email: {
//             type: String,
//             trim: true,
//             match: [/^\S+@\S+\.\S+$/, "Format d'email invalide"]
//         },
//         phone: {type: String, trim: true},
//         linkedin: {type: String, trim: true}
//     }],
//     timeline: [{
//         date: {type: Date, default: Date.now},
//         type: {
//             type: String,
//             enum: ['applied', 'followup', 'phone_screen', 'interview_hr', 'interview_tech', 'test', 'offer', 'rejected', 'ghosted'],
//             required: true
//         },
//         note: {type: String, trim: true}
//     }],
//     attachments: [{
//         filename: {type: String, required: true},
//         path: {type: String, required: true},
//         type: {
//             type: String,
//             enum: ['response_email', 'cv_sent', 'job_description', 'other'],
//             default: 'other'
//         },
//         addedAt: {type: Date, default: Date.now}
//     }],
//     notes: {
//         type: String,
//         trim: true
//     }
// }, {timestamps: true});

const TERMINAL_STATUSES = ['accepted', 'rejected', 'ghosted'];

// --- Jours restants avant relance (négatif = dépassée) ---
applicationSchema.virtual('daysUntilFollowup').get(function () {
    if (!this.followupDate) return null;
    if (TERMINAL_STATUSES.includes(this.status)) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(this.followupDate);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
});

// --- Relance dépassée ---
applicationSchema.virtual('isOverdue').get(function () {
    if (!this.followupDate) return false;
    if (TERMINAL_STATUSES.includes(this.status)) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return new Date(this.followupDate) < now;
});

// --- Couleur d'urgence ---
applicationSchema.virtual('urgencyColor').get(function () {
    if (TERMINAL_STATUSES.includes(this.status)) return 'none';
    if (this.status === 'wishlist') return 'neutral';
    const days = this.daysUntilFollowup;
    if (days === null) return 'neutral';
    if (days < 0) return 'red';
    if (days <= 1) return 'darkOrange';
    if (days <= 3) return 'orange';
    if (days <= 6) return 'yellow';
    return 'neutral';
});

// --- Score d'urgence pour le tri (plus bas = plus urgent) ---
applicationSchema.virtual('urgencyScore').get(function () {
    if (TERMINAL_STATUSES.includes(this.status)) return 99999;
    if (this.status === 'wishlist') return 99998;
    const days = this.daysUntilFollowup;
    if (days === null) return 9999;
    return days;
});

// Inclure les virtuals dans les réponses JSON
applicationSchema.set('toJSON', {virtuals: true});
applicationSchema.set('toObject', {virtuals: true});

// --- INDEX ---
applicationSchema.index({company: 'text', position: 'text', notes: 'text'});
applicationSchema.index({status: 1, followupDate: 1});

module.exports = mongoose.model('Application', applicationSchema);