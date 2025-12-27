import { useState, useEffect,useRef} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // 로그인 완료후 페이지 이동 처리
import { useAuth } from '../hooks/useAuth'; // access token 저장하기 위해
import axios from 'axios'; // 백엔드 호출용

import './OAuthCallback.css'; //style sheet 불러오기

function OAuthCallback() {

    const navigate = useNavigate();

    // URL 쿼리 파라미터를 읽기 위한 Hook
    // ex) xxx?status=success 여기에서 status라는 변수명(파라미터 이름)과 값을 읽어옴
    const [searchParams] = useSearchParams();

    // 에러 상태 생성
    const [error, setError] = useState(null);

    // AuthContext에서 login 함수 가져옴
    const {login} = useAuth();

    // 로딩 상태
    const [isLoading, setIsLoading] = useState(true); // 기본값을 로딩중...으로 설정

    // 중복 실행을 방지하기 위한 flag(상태)
    // react StrictMode가 개발모드에서 useEffect를 두 번 실행하는 것을 방지하기 위해 사용함
    // useRef는 컴포넌트가 리렌더링되어도 값을 유지시킴
    const hasExecuteRef = useRef(false);
    
    const handleError = (errorMessage) => {
        setError(errorMessage);
        setIsLoading(false);
        setTimeout(()=>{
            navigate('/login');
        }, 3000);
    }

    const handleRequestToken = async () => {

        // Back-End 서버에 token을 요청한다
        const response = await axios.post('/api/oauth/kakao/exchange-token',
            {},
            {withCredentials: true}
        );

        console.log(response.data);

        if (response.data.success) {
            // AuthContext에 서버로부터 받은 user 정보와 token을 저장한다
            // AuthPronvider의 login()함수를 호출
            login(response.data.data.user, response.data.data.accessToken);
            navigate('/');
            return;
        }
        
        // 받은 데이터를 분석하여 AuthContext에 저장하고,
        // user 정보는 
        throw new Error(response.data.message || '토큰 요청 실패'); 
        
    }

    // 실제 콜백을 받아 처리할 함수
    const handleCallback = async() => {
        try{
            const status = searchParams.get('status');
            console.log('Back-End 서버로부터 Callback이 호출되어 처리하기 시작함');
            console.log('현재 URL:', window.location.href);
            console.log('status:', status);

            // 로그인 성공이면
            if (status==='success'){
                console.log('카카오 로그인 성공');
                console.log('Back-End 서버에 Access Token/REfresh Token을 요청해야 함');
                handleRequestToken();
                return;
            }

            // 여기까지 오면 무조건 실패임
                console.log('카카오 로그인 실패');
                console.log('to-do: Back-End로부터 Error 원인을 수신해야 함');
                const errorMessage = searchParams.get('message');
                handleError(errorMessage);

        } catch(error) {
            console.log('카카오 로그인 실패',error);
            handleError(error.data.errorMessage);
        }
    }

    // 컴폰턴트가 마운트될때 실행됨
    useEffect(()=>{
        if (hasExecuteRef.current) {
            console.log('중복 실행방지 처리');
            return;
        }

        hasExecuteRef.current = true;
        handleCallback();
    }, [searchParams,navigate, login]);

    return (
        <>
        <div>
            {
                isLoading ? (
                    <div>
                        <p>로그인 처리중...</p>
                        <p>잠시만 기다려 주세요</p>
                    </div>
                ) : (
                    <div>
                        <p>로그인 실패</p>
                        <p>{error}</p>
                    </div>
                )
            }
        </div>
        </>
    );

}

export default OAuthCallback;