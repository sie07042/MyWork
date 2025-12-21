import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import axios from "axios";

export function AuthProvider({children}) {
    // 사용자 정보(이메일, 사용자 이름, id) 상태(state)
    const [user, setUser] = useState(null);

    // AccessToken 상태(state)
    const [accessToken, setAccessToken] = useState(null);

    // 로딩중 여부 상태
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Login 함수
     * 
     * 로그인성공시에 호춣되는 함수로써
     * 서버로부터 받은 사용자 정보와 토큰을 저장한다.
     * 
     * @param {object} userData - 서버로부터 받은 사용자 정보
     * @param {string} token - 서버로부터 받은 access token
     */
    const login = (userData, token) => {
    console.log('AuthProvider.login() 실행');
    setUser(userData); //이메일, id, 사용자 이름
    setAccessToken(token);
    localStorage.setItem('user', JSON.stringify(userData)); //간단 사용자 정보만 로컬 스토리지에 저장한다.
   }

    /**
     * Logout 함수
     * 사용자가 로그아웃 기능을 사용하면 호출되는 함수
     * 백엔드 서버에 /Logout 요청을 보내고 저장되어 있는 모든 인증 정보들을 삭제한다.
     */
    const logout = async () => {
        try {
            const response = await axios.post(
                '/api/logout',      // request url
                {},                 // request body
                { withCredentials: true }
            );
    
            if (response.data.success) {
                console.log('로그아웃 성공');
            } else {
                console.log('로그아웃 실패');
            }
    
        } catch (error) {
            console.log('로그아웃 실패:', error);
        } finally {
            // AuthContext 상태 초기화
            setUser(null);
            setAccessToken(null);
            localStorage.removeItem('user');
        }
    };
    
    /**
     * Refresh Access Token : Access Token 새로 발급
     * 
     * Http-only cookie에 저장되어 있는 Refresh Token을 이용하여 
     * 새로운 Access Token을 발급받는 함수
     * 
     * @return {Promise<string>} - 새로운 Access Token
    */
    const refreshAccessToken = async () => {
        try {
            const response = await axios.post('/api/refresh',
                {}, //request body
                {withCredentials: true, //http only 전용 쿠키 전송
                    headers: {'Content-Type': 'application/json'}
                }
            );

            if(response.data.success) {
                const newAccessToken = response.data.data.accessToken;
                const userData = response.data.data.user;

                // state update
                setUser(userData);
                setAccessToken(newAccessToken);
                localStorage.setItem(userData);

                return newAccessToken;

            } else {
                //refres Access Token 실패
                console.log('/api/refresh 요청 실패', response.data.message);
                setUser(null);
                setAccessToken(null);
                localStorage.removeItem('user');

                // return
            }

        } catch(error) {
            //refres Access Token 실패
            console.log('/api/refresh 요청 실패', error);
            setUser(null);
            setAccessToken(null);
            localStorage.removeItem('user');

            // return
        }
    }

    // 컴포넌트 마운트되는 시점에서 인증정보를 복원
    useEffect(()=> {
        const chsckAuth = async () => {
            // 1. 로그인된 상태인지 점검해보고 로그인된 상태이면 /api/refresh 호출을 생략한다.
            if (user && accessToken) {
                console.log('이미 로그인된 상태')
                setIsLoading(false);
                return;
            }
            
            // 2. 로그인된 이력이 있는지 LocalStorage를 보고 확인해보고 없다면 /api/refresh 호출을 생략한다.
            const savedUser = localStorage.getItem('user');
            if (!savedUser) {
                console.log('로그인 이력이 없음');
                setIsLoading(false);
                return;
            }

            // 3. 사용자 정보가 있다면 토큰 갱신을 시도
            try {
                console.log('컴포넌트 마운트 이벤트 발생')
                console.log('/api/refresh 호출함')

                const response = await axios.post('/api/refresh',
                    {},
                    {
                        withCredentials : true, // http only 전용 쿠키 전송
                        headers: {'Content-Type': 'application/json'}
                    }
                );

                if (response.data.success) {
                    const token = response.data.data.accessToken;
                    const userData = JSON.parse(savedUser);

                    // 복원 완료
                    setUser(userData);
                    setAccessToken(token);
                    console.log('사용자 정보 복원 완료', token);
                } else {
                    console.log('사용자 정보 복원 실패: ',response.data.message);
                    localStorage.removeItem('user');
                }
            } catch(error) {
                    console.log('사용자 정보 복원 실패: ', error);
                    localStorage.removeItem('user');

            } finally {
                setIsLoading(false);
            }
        };

        chsckAuth();
    }, []); //두번째 파라미터를 빈 배열로 두면 컴포넌트 마운트시에 한번 실행된다.

        // Authentication Context(AuthContext)에서 제공할 값(기능)
        const value = {
            user,
            accessToken,
            isLoading,
            login,
            logout,
            refreshAccessToken,
            isAuthenticated: !!user
        };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}