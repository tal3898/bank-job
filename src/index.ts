import cron from 'node-cron';


cron.schedule('*/10 * * * * *', () => {
    console.log('Running this task every 10 seconds');
});