import { Router } from 'express';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import { getCustomRepository, getRepository } from 'typeorm';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/upload';
import multer from 'multer';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const balance = await transactionsRepository.getBalance();

  const transactions = await transactionsRepository.find();

  return response.json({
    transactions,
    balance
  });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransactionService = new CreateTransactionService();

  const transaction = await createTransactionService.execute({title, value, type, category_title: category});

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransactionService = new DeleteTransactionService();

  await deleteTransactionService.execute({transaction_id: id});

  return response.json({message: 'Transaction deleted'});
});

transactionsRouter.post('/import', upload.single('file'), async (request, response) => {
  const importTransactionsService = new ImportTransactionsService();

  const transactions = await importTransactionsService.execute({
    csvFileName: request.file.filename
  })

  return response.json(transactions)
});

export default transactionsRouter;
