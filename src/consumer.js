require('dotenv').config();
const amqp = require('amqplib');
const MailSender = require('./service/mail/MailService');
const PlaylistService = require('./service/postgres/PlaylistService');
const Listener = require('./service/rabbitmq/Listener');

const init = async () => {
  const listener = new Listener(new PlaylistService(), new MailSender());

  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();

  await channel.assertQueue('export:playlist', {
    durable: true,
  });

  channel.consume('export:playlist', listener.listen, { noAck: true });
  console.log('Consumer Runned');
};

init();
