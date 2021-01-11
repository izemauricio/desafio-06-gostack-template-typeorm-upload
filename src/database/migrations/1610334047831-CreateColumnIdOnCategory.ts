import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export default class CreateColumnIdOnCategory1610334047831
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'transactions',
      new TableColumn({
        name: 'category_id', // nome da nova coluna
        type: 'uuid', // tipo string, varchar, uuid
        isNullable: true, // permite null
      }),
    );

    await queryRunner.createForeignKey(
      'transactions', // nome da tabela que vou colocar a chave estrangeira
      new TableForeignKey({
        columnNames: ['category_id'], // tabelaTransaction.category_id vai guardar a chave_estrangeira (o id de outra tabela)
        referencedColumnNames: ['id'], // guarda a id de uma entre em categorias: categories.id
        referencedTableName: 'categories', // tabela que estou referenciando
        name: 'TransactionCategory',
        onUpdate: 'CASCADE', // se category.id for alterado, altera na tabela transaction.category_id (chaveEstrangeria) tb
        onDelete: 'SET NULL', // se category.id for deletado, seta essa chave estrangeira para null
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('transactions', 'transactionCategory');
    await queryRunner.dropColumn('transactions', 'category_id');
  }
}
