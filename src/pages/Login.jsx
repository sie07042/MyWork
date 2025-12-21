import GNB from "../components/Gnb";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import "./signup.css"
import axios from "axios";

function Login(){

    // 페이지 이동 처리를 위한 hook 설정
    const navigate = useNavigate();

    // useAuth 커스텀 훅을 이용하여 AuthProvider가 제공하는 값 또는 가능에 접근
    const { login } = useAuth();

    // 회원가입 폼의 데이터를 관리하기 위한 상태(state) 정의
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    
    // 폼 유효성 검사 에러 메세지를 처리하기 위한 상태(state)
     const [errors, setErrors] = useState({});

        
    // API 요청중인지 여부를 나타내는 로딩 상태(state)
    const [isLoading,setIsLoading] = useState(false);

    // 이메일 검증
    const isValidEmail = (email) => {
        // email 문자열에서 @의 위치를 찾는다.
        const atIndex = email.indexOf('@');

        // email 문자열에서 제일 마지막에 나오는 .을 찾는다.
        const dotIndex = email.lastIndexOf('.');

        // 유효성 검사: @기호가 있어야하고, @ 뒤쪽으로 .이 나와야 하고, .으로 끝나지 않아야 한다.
        return atIndex > 0 && dotIndex > atIndex + 1 && dotIndex <email.length -1;
    }

    // form의 유효성 검사하기 
    const validateForm = () => {
        const newErrors = {};

        // 이메일 검증
        if (!formData.email){
            newErrors.email = '이메일을 입력해주세요'
        } else if (!isValidEmail(formData.email)){
            newErrors.email = '이메일 형식이 올바르지 않습니다'
        }

        // 비밀번호 검증
        if (!formData.password){
            newErrors.password = '비밀번호를 입력해주세요'
        } else if (formData.password.length < 8){
            newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다'
        }

        // 에러 상태를 저장한다
        setErrors(newErrors);

        // 에러가 없으면(newErorrs에 항목들이 없으면) true를 반환 
        return Object.keys(newErrors).length ===0;
    } 


    // 로그인 버튼을 클릭했을때 실행되는 함수
    // 로그인 보안 원칙
    // 1. AccessToken은 절대 LocalStorage나 SessionStorage에 저장하지 않는다.
    // 2. RefrshToken은 Http Only 쿠키로만 관리한다. --> Javascript에서 접근 불가
    // 3. 페이지 새로고침시에는 /apiefresh를 호출하여 AccessToken을 새로 발급받는다. <-- 메모리에 저장하기 때문에
    // React의 Context: 전역 데이터 저장 공간(메모리), AccessToken을 Context에 저장 -> 외부 노출 방지
    // 문제점 : 페이지 새로고침시에 모든 데이터 날라감
    const handleSubmit = async (e) => {
        e.preventDefault(); //기본 동작을 막는다(새로고침 처리를 방지)

        // 폼 유효성 검사하기
        if (!validateForm()) {
            return; // 검증 실패시 즉시 함수 종료
        }

        // 로딩중... 상태를 true
        setIsLoading(true);

        try{
            // axios모듈을 이용하여 /login 호출하기 // CORS : /api/login ===> http://localhost:8070/login
            const response = await axios.post('/api/login',
                {
                    email: formData.email, // 사용자가 form에 입력한 email
                    password : formData.password // 사용자가 form에 입력한 password
                }
            );

            // 응답 확인해보기 
            // response.data : response 객체의 body 영역에 들어온 데이터를 말함
            if (response.data.success){
                // 로그인 성공
                console.log('로그인 성공');

                // AuthContext에 서버로부터 받은 user 정보와 token을 저장한다
                // AuthPronvider의 login()함수를 호출
                login(response.data.data.user, response.data.data.accessToken)

                navigate('/'); // 홈으로 페이지를 이동시킨다
            } else {
                // 로그인 실패
                alert('로그인 실패: ' + response.data.message);
            }
            
        }catch(error) {
            //  로그인 실패
            console.log('로그인 에러 : ', error);
            alert(error.response.data.message)
        } finally{
            setIsLoading(false);

        }
    }

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev =>({
            ...prev,
            [name]: value
        }));
    }

    const handleKakaoLogin =(e) => {
        e.preventDefault();
    }

    return (
        <>
            <GNB/>
            <div className="signup-container">
                <div className="signup-card">
                    <h1>로그인</h1>
                    <form onSubmit={handleSubmit} className="signup-form">
                        <div className="form-group">
                            <input type="email" 
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="이메일을 입력하세요"
                                className={errors.email ? 'error' : ''}/>

                            {errors.email && <span className="error-message">{errors.email}</span>}    
                        </div>

                        <div className="form-group">
                            <input type="password" 
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="비밀번호를 입력하세요"
                                className={errors.password ? 'error' : ''}/>

                            {errors.password && <span className="error-message">{errors.password}</span>}    
                        </div>

                        <div className="button-group">
                            <button type="submit" className="signup-button" disabled={isLoading}>
                                {isLoading ? '처리중 ...': '로그인'}
                            </button>
                        </div>

                        <div className="social-login-group">
                            <button type="button" 
                            className="kakao-login-button" 
                            onClick={handleKakaoLogin}
                            disabled={isLoading}>
                                {isLoading ? '처리중 ...': '카카오 로그인'}
                            </button>
                        </div>
                        <div className="signup-link">
                            <p> 
                                계정이 없으신가요? <Link to="/signup">회원가입</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
            
        </>
    );
}

export default Login;