import { useNavigate } from "react-router-dom";
import GNB from "../components/Gnb";
import { useState } from "react";
import axios from "axios";
import "./Signup.css"

function Signup() {

    // 페이지 이동 처리를 위한 hook 설정
    const navigate = useNavigate();

    // 회원가입 폼의 데이터를 관리하기 위한 상태(state) 정의
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        username: ''
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

        // 비밀번호 확인 검증
        if (!formData.confirmPassword){
            newErrors.confirmPassword = '비밀번호 확인을 입력해주세요'
        } else if (formData.password !== formData.confirmPassword){
            newErrors.confirmPassword = '비밀번호가 일치하지 않습니다'
        }

        // 사용자 이름 검증 
        if (!formData.username){
            newErrors.username = '이름을 입력해주세요'
        }

        // 에러 상태를 저장한다
        setErrors(newErrors);

        // 에러가 없으면(newErorrs에 항목들이 없으면) true를 반환 
        return Object.keys(newErrors).length ===0;
    } 

    // form 데이터를 갖고 Back-End /signup을 요청한다.
    const handleSubmit = async (e) => {
        e.preventDefault(); //기본 동작을 막는다(새로고침 처리를 방지)

        // 폼 유효성 검사하기
        if (!validateForm()) {
            return; // 검증 실패시 즉시 함수 종료
        }

        setIsLoading(true);

        try{
            // axios모듈을 이용하여 /signup 호출하기 // CORS : /api/signup ===> http://localhost:8070/signup
            const response = await axios.post('/api/signup',
                {
                    email: formData.email,
                    password : formData.password,
                    username: formData.username
                }
            );

            // 응답 확인해보기
            if (response.data.success){
                // 회원가입 성공
                console.log('회원가입 성공');
                navigate('/'); // 홈으로 페이지를 이동시킨다
            } else {
                // 회원가입 실패
                alert('회원가입 실패: ' + response.data.message);
            }
            
        }catch(error) {
            //  회원가입 실패
            console.log('회원가입 에러 : ', error);
            alert('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.')
        } finally{
            setIsLoading(false);

        }

    }

    // 입력 폼의 값이 변경될때 호출되는 이벤트 핸들러 함수
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev =>({
            ...prev,
            [name]: value
        }));


    }

    return (
        <>
            <GNB/>
            <div className="signup-container">
                <div className="signup-card">
                    <h1>회원가입</h1>
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

                        <div className="form-group">
                            <input type="password" 
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="비밀번호를 입력하세요"
                                className={errors.confirmPassword ? 'error' : ''}/>

                            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                        </div>
                        {}

                        <div className="form-group">
                            <input type="text" 
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="이름을 입력하세요"
                                className={errors.username ? 'error' : ''}/>

                            {errors.username && <span className="error-message">{errors.username}</span>}  
                        </div>

                        <div className="button-group">
                            <button type="submit" className="signup-button" disabled={isLoading}>
                                {isLoading ? '처리중 ...': '회원가입'}
                            </button>

                        </div>
                    </form>
                </div>
            </div>
            
        </>
    );
}

export default Signup;