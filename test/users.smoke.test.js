const test = require("node:test");
const assert = require("node:assert/strict");

const userController = require("../src/modules/users/user.controller");

const userServicePath = require.resolve("../src/modules/users/user.service");
const userModelPath = require.resolve("../src/modules/users/user.model");
const hashPasswordPath = require.resolve("../src/utils/hashPassword");

const createRes = () => {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.payload = data;
      return this;
    },
  };
};

const loadUserService = ({ userModel, hashPassword, comparePassword }) => {
  const originalCache = {
    userService: require.cache[userServicePath],
    userModel: require.cache[userModelPath],
    hashPassword: require.cache[hashPasswordPath],
  };

  delete require.cache[userServicePath];
  require.cache[userModelPath] = {
    id: userModelPath,
    filename: userModelPath,
    loaded: true,
    exports: userModel,
  };
  require.cache[hashPasswordPath] = {
    id: hashPasswordPath,
    filename: hashPasswordPath,
    loaded: true,
    exports: {
      hashPassword,
      comparePassword,
    },
  };

  const userService = require(userServicePath);

  const restore = () => {
    delete require.cache[userServicePath];
    delete require.cache[userModelPath];
    delete require.cache[hashPasswordPath];

    const pathByKey = {
      userService: userServicePath,
      userModel: userModelPath,
      hashPassword: hashPasswordPath,
    };

    Object.entries(originalCache).forEach(([key, value]) => {
      if (value) {
        require.cache[pathByKey[key]] = value;
      }
    });
  };

  return { userService, restore };
};

const createUserRow = (overrides = {}) => {
  return {
    id: 1,
    full_name: "Customer User",
    email: "customer@example.com",
    phone: "012345678",
    password_hash: "stored-hash",
    role_name: "customer",
    status_name: "active",
    profile_image_url: null,
    gender: null,
    date_of_birth: null,
    address: null,
    last_login: null,
    email_verified_at: null,
    ...overrides,
  };
};

test("update profile returns 400 when no profile fields are provided", async () => {
  const req = { user: { id: 1 }, body: {} };
  const res = createRes();
  const next = () => {};

  await userController.updateMe(req, res, next);

  assert.equal(res.statusCode, 400);
  assert.equal(res.payload.success, false);
  assert.equal(res.payload.message, "Validation failed");
});

test("change password returns 400 for invalid payload", async () => {
  const req = { user: { id: 1 }, body: {} };
  const res = createRes();
  const next = () => {};

  await userController.changePassword(req, res, next);

  assert.equal(res.statusCode, 400);
  assert.equal(res.payload.success, false);
  assert.equal(res.payload.message, "Validation failed");
});

test("user service updates profile fields and allows clearing optional values", async () => {
  const calls = {};
  let readCount = 0;
  const beforeUpdate = createUserRow({
    phone: "012345678",
    address: "Old address",
  });
  const afterUpdate = createUserRow({
    full_name: "Updated User",
    phone: null,
    address: "New address",
  });

  const { userService, restore } = loadUserService({
    userModel: {
      findUserById: async () => {
        readCount += 1;
        return readCount === 1 ? beforeUpdate : afterUpdate;
      },
      updateProfile: async (userId, profile) => {
        calls.updateProfile = { userId, profile };
      },
    },
    hashPassword: async () => "new-hash",
    comparePassword: async () => true,
  });

  try {
    const user = await userService.updateMyProfile(1, {
      full_name: "Updated User",
      phone: null,
      address: "New address",
    });

    assert.deepEqual(calls.updateProfile, {
      userId: 1,
      profile: {
        full_name: "Updated User",
        phone: null,
        profile_image_url: null,
        gender: null,
        date_of_birth: null,
        address: "New address",
      },
    });
    assert.equal(user.full_name, "Updated User");
    assert.equal(user.phone, null);
    assert.equal(user.address, "New address");
    assert.equal(Object.hasOwn(user, "password_hash"), false);
  } finally {
    restore();
  }
});

test("user service changes password after verifying the current password", async () => {
  const calls = {};
  const { userService, restore } = loadUserService({
    userModel: {
      findUserById: async () => createUserRow(),
      updatePassword: async (userId, passwordHash) => {
        calls.updatePassword = { userId, passwordHash };
      },
    },
    hashPassword: async (password) => {
      calls.hashPassword = password;
      return "new-hash";
    },
    comparePassword: async (password, hash) => {
      calls.comparePassword = { password, hash };
      return true;
    },
  });

  try {
    await userService.changeMyPassword(1, {
      current_password: "old-password",
      new_password: "new-password",
    });

    assert.deepEqual(calls.comparePassword, {
      password: "old-password",
      hash: "stored-hash",
    });
    assert.equal(calls.hashPassword, "new-password");
    assert.deepEqual(calls.updatePassword, {
      userId: 1,
      passwordHash: "new-hash",
    });
  } finally {
    restore();
  }
});

test("user service rejects password change when current password is wrong", async () => {
  const { userService, restore } = loadUserService({
    userModel: {
      findUserById: async () => createUserRow(),
      updatePassword: async () => {
        throw new Error("should not update password");
      },
    },
    hashPassword: async () => "new-hash",
    comparePassword: async () => false,
  });

  try {
    await assert.rejects(
      userService.changeMyPassword(1, {
        current_password: "wrong-password",
        new_password: "new-password",
      }),
      (error) => {
        assert.equal(error.message, "Current password is incorrect");
        assert.equal(error.statusCode, 401);
        return true;
      }
    );
  } finally {
    restore();
  }
});
