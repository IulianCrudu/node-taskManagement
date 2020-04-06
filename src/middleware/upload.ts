import multer from 'multer';

const upload = multer({
	dest: 'avatars',
});

export default upload;
