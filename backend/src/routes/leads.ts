import express, { type Response, type NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import Lead from '../models/Lead.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { sendError, sendPaginated, sendSuccess } from '../utils/apiResponse.js';
import {
  buildLeadFilter,
  getPagination,
  getSortOrder,
  type LeadQueryParams
} from '../utils/leadQuery.js';
import type { AuthRequest, PaginationMeta } from '../types/index.js';

const router = express.Router();

const leadValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('status')
    .optional()
    .isIn(['New', 'Contacted', 'Qualified', 'Lost'])
    .withMessage('Invalid status'),
  body('source')
    .isIn(['Website', 'Instagram', 'Referral'])
    .withMessage('Invalid source')
];

const formatLead = (lead: {
  _id: unknown;
  name: string;
  email: string;
  status: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: { _id?: unknown; name?: string; email?: string };
}) => ({
  id: lead._id,
  name: lead.name,
  email: lead.email,
  status: lead.status,
  source: lead.source,
  createdAt: lead.createdAt,
  updatedAt: lead.updatedAt,
  createdBy: lead.createdBy
    ? {
        id: lead.createdBy._id,
        name: lead.createdBy.name,
        email: lead.createdBy.email
      }
    : undefined
});

const escapeCsv = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

router.use(protect);

router.get(
  '/',
  [
    query('status')
      .optional()
      .isIn(['New', 'Contacted', 'Qualified', 'Lost']),
    query('source').optional().isIn(['Website', 'Instagram', 'Referral']),
    query('sort').optional().isIn(['latest', 'oldest']),
    query('page').optional().isInt({ min: 1 })
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        sendError(res, 'Validation failed', 400, errors.array());
        return;
      }

      const params = req.query as LeadQueryParams;
      const filter = buildLeadFilter(params);
      const { page, limit, skip } = getPagination(params.page);
      const sortOrder = getSortOrder(params.sort);

      const [leads, total] = await Promise.all([
        Lead.find(filter)
          .populate('createdBy', 'name email')
          .sort({ createdAt: sortOrder === 'latest' ? -1 : 1 })
          .skip(skip)
          .limit(limit),
        Lead.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / limit) || 1;
      const pagination: PaginationMeta = {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      };

      sendPaginated(
        res,
        leads.map((l) => formatLead(l.toObject())),
        pagination
      );
    } catch (error) {
      next(error);
    }
  }
);

router.get('/export/csv', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const params = req.query as LeadQueryParams;
    const filter = buildLeadFilter(params);
    const sortOrder = getSortOrder(params.sort);

    const leads = await Lead.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: sortOrder === 'latest' ? -1 : 1 });

    const headers = ['Name', 'Email', 'Status', 'Source', 'Created At', 'Created By'];
    const rows = leads.map((lead) => {
      const createdByName =
        typeof lead.createdBy === 'object' && lead.createdBy && 'name' in lead.createdBy
          ? String((lead.createdBy as { name: string }).name)
          : '';
      return [
        escapeCsv(lead.name),
        escapeCsv(lead.email),
        escapeCsv(lead.status),
        escapeCsv(lead.source),
        escapeCsv(lead.createdAt.toISOString()),
        escapeCsv(createdByName)
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads-export.csv');
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
});

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid lead ID')],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        sendError(res, 'Validation failed', 400, errors.array());
        return;
      }

      const lead = await Lead.findById(req.params.id).populate('createdBy', 'name email');

      if (!lead) {
        sendError(res, 'Lead not found', 404);
        return;
      }

      sendSuccess(res, formatLead(lead.toObject()));
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  leadValidators,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        sendError(res, 'Validation failed', 400, errors.array());
        return;
      }

      const { name, email, status, source } = req.body as {
        name: string;
        email: string;
        status?: string;
        source: string;
      };

      const lead = await Lead.create({
        name,
        email,
        status: status || 'New',
        source,
        createdBy: req.user!._id
      });

      await lead.populate('createdBy', 'name email');

      sendSuccess(res, formatLead(lead.toObject()), 201, 'Lead created successfully');
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:id',
  [param('id').isMongoId(), ...leadValidators],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        sendError(res, 'Validation failed', 400, errors.array());
        return;
      }

      const lead = await Lead.findById(req.params.id);

      if (!lead) {
        sendError(res, 'Lead not found', 404);
        return;
      }

      const { name, email, status, source } = req.body as {
        name: string;
        email: string;
        status?: string;
        source: string;
      };

      lead.name = name;
      lead.email = email;
      if (status) lead.status = status as typeof lead.status;
      lead.source = source as typeof lead.source;

      await lead.save();
      await lead.populate('createdBy', 'name email');

      sendSuccess(res, formatLead(lead.toObject()), 200, 'Lead updated successfully');
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  authorize('admin'),
  [param('id').isMongoId().withMessage('Invalid lead ID')],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        sendError(res, 'Validation failed', 400, errors.array());
        return;
      }

      const lead = await Lead.findByIdAndDelete(req.params.id);

      if (!lead) {
        sendError(res, 'Lead not found', 404);
        return;
      }

      sendSuccess(res, null, 200, 'Lead deleted successfully');
    } catch (error) {
      next(error);
    }
  }
);

export default router;
