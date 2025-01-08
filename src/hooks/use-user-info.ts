interface UserInfo {
  id: string;
  email: string;
  name: string;
  department_id: string;
  department_name: string;
}

export function useUserInfo() {
  const getUserInfo = (): UserInfo | null => {
    const userInfoStr = localStorage.getItem('user_info');
    if (!userInfoStr) return null;
    
    try {
      return JSON.parse(userInfoStr);
    } catch (error) {
      console.error('Failed to parse user info:', error);
      return null;
    }
  };

  return getUserInfo();
} 