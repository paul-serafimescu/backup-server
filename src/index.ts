import bot from './client';
import * as config from './config';

export default (function() {
    if (typeof require !== 'undefined' && require.main === module) {
        bot.login(config.BOT_TOKEN);
    }
})();
