import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  Animated,
  Easing,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import GradientBackground from "./GradientBackground";
import InputField from "./InputField";
import { loginUser } from "../store/actions/authActions";
import { clearAuthError } from "../store/slices/authSlice";

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-30)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(30)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(headerSlide, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(formSlide, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [footerOpacity, formOpacity, formSlide, headerOpacity, headerSlide]);

  useEffect(() => {
    if (error) {
      Alert.alert("Login Failed", Array.isArray(error) ? error.join("\n") : error);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: "MainApp" }],
      });
    }
  }, [isAuthenticated, navigation]);

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert("Validation Error", "Email is required");
      return false;
    }

    if (!password.trim()) {
      Alert.alert("Validation Error", "Password is required");
      return false;
    }

    return true;
  };

  const handleLoginPress = async () => {
    if (!validateForm()) return;

    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 90,
        useNativeDriver: true,
      }),
    ]).start();

    await dispatch(
      loginUser({
        email: email.trim().toLowerCase(),
        password,
      })
    );
  };

  return (
    <GradientBackground opacity={0.9}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.headerSection,
              {
                opacity: headerOpacity,
                transform: [{ translateY: headerSlide }],
              },
            ]}
          >
            <View style={styles.v1Cont}>
              <Image
                source={require("../assets/images/login-vector.png")}
                style={styles.v1}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>log in</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.formSection,
              {
                opacity: formOpacity,
                transform: [{ translateY: formSlide }],
              },
            ]}
          >
            <View style={styles.inputWrapper}>
              <InputField
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                iconName="email"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <InputField
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? "visibility" : "visibility-off"}
                onRightIconPress={() => setShowPassword((prev) => !prev)}
                iconName="lock"
              />
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => navigation.navigate("ForgotPasswordScreen")}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Animated.View
              style={[styles.buttonWrapper, { transform: [{ scale: buttonScale }] }]}
            >
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLoginPress}
                activeOpacity={0.85}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>LOG IN</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          <Animated.View style={[styles.footerSection, { opacity: footerOpacity }]}>
            <View style={styles.socialContainer}>
              <View style={styles.dividerRow}>
                <View style={styles.line} />
                <Text style={styles.socialText}>Or Login With</Text>
                <View style={styles.line} />
              </View>

              <View style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton}>
                  <Image
                    source={require("../assets/images/Google-Icon.png")}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.socialButton}>
                  <Image
                    source={require("../assets/images/Facebook-Icon.png")}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.socialButton}>
                  <Image
                    source={require("../assets/images/Apple-Icon.png")}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.signupRow}>
              <Text style={styles.signupPrompt}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("SignUpScreen")}>
                <Text style={styles.signupText}>Sign Up Now</Text>
              </TouchableOpacity>
            </View>

            <Image
              source={require("../assets/images/logo.jpg")}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  headerSection: {
    alignItems: "center",
    width: "100%",
  },
  v1Cont: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 65,
  },
  v1: {
    width: 220,
    height: 220,
  },
  title: {
    fontFamily: "Oswald-Bold",
    fontSize: 28,
    color: "#FFFFFF",
    marginBottom: 20,
    marginTop: 7,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  formSection: {
    width: "100%",
    alignItems: "center",
  },
  inputWrapper: {
    width: "100%",
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    paddingRight: 5,
    marginTop: 4,
    marginBottom: 20,
  },
  forgotText: {
    color: "#ffffff",
    fontSize: 14,
    fontFamily: "Oswald-Regular",
  },
  buttonWrapper: {
    width: "100%",
  },
  loginButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#047ec9",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#047ec9",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Oswald-Bold",
    letterSpacing: 2,
  },
  footerSection: {
    width: "100%",
    alignItems: "center",
  },
  socialContainer: {
    marginTop: 24,
    alignItems: "center",
    width: "100%",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.35)",
    marginHorizontal: 8,
  },
  socialText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Oswald-Regular",
    letterSpacing: 0.5,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: 16,
  },
  socialButton: {
    width: 80,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  socialIcon: {
    width: 30,
    height: 30,
  },
  signupRow: {
    flexDirection: "row",
    marginTop: 24,
    gap: 5,
  },
  signupPrompt: {
    color: "white",
    fontFamily: "Oswald-Regular",
  },
  signupText: {
    color: "#ffffff",
    textDecorationLine: "underline",
    fontFamily: "Oswald-Regular",
    letterSpacing: 0.9,
  },
  logo: {
    marginTop: 25,
    height: 120,
    width: 220,
    opacity: 0.4,
  },
});