import { useSelector, useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure, logout as logoutAction } from '../redux/userSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const { currentUser, isAuthenticated, loading, error } = useSelector((s) => s.user);

  return {
    user: currentUser,
    isAuthenticated,
    role: currentUser?.role ?? null,
    loading,
    error,
    loginBegin:   ()    => dispatch(loginStart()),
    login:        (u)   => dispatch(loginSuccess(u)),
    loginFail:    (msg) => dispatch(loginFailure(msg)),
    logout:       ()    => dispatch(logoutAction()),
  };
};

export default useAuth;
