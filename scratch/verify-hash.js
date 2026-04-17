const bcrypt = require('bcryptjs');

const password = 'sitepu88';
const hash = '$2b$10$fHDzf2v53EkOpcrKN6usI.wbgpzyoGjBwZmEt668cT4nXf2TSLW4K';

bcrypt.compare(password, hash).then(result => {
    console.log('Match:', result);
});
