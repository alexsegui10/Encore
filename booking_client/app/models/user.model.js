import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        match: [/\S+@\S+\.\S+/, 'is invalid'],
        index: true
    },
    bio: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: "https://static.productionready.io/images/smiley-cyrus.jpg"
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
},
    {
        timestamps: true
    });

userSchema.plugin(uniqueValidator);

userSchema.methods.toUserResponse = function (jwt_access) {
    return {
        username: this.username,
        email: this.email,
        bio: this.bio,
        image: this.image,
        role: this.role,
        accessToken: jwt_access,
    };
};

userSchema.methods.toProfileJSON = function () {
    return {
        username: this.username,
        bio: this.bio,
        image: this.image,
        email: this.email
    }
};

export default mongoose.model('User', userSchema);
