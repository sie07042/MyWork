import { useNavigate } from "react-router-dom";
import GNB from "../components/Gnb";
import { useAuth } from "../hooks/useAuth";
import './Profile.css'
import { useProfileForm } from "../hooks/UserProfileForm";

function Profile() {
    
    // 페이지 이동을 위한 객체 정의
    const navigate = useNavigate();

    // 사용자 인증 정보를 저장할 state
    const { isAuthenticated, accessToken } = useAuth();

    console.log('로그인? : ', isAuthenticated);
    console.log('토큰: ', accessToken);

    // 사용자 기본 프로필 정보 정의
    const {
        formData,
        errors,
        isLoading,
        isLoadingProfile,
        handleChange,
        submitProfile
    } = useProfileForm(accessToken);


    // 폼 submit 기능 구현
    const handleSubmit = async (e) => {
        // Profile 수정을 위한 api 호출
        e.preventDefault();

        try{
            const success = await submitProfile();
            if (success) {
                alert('프로필이 수정되었습니다');
                navigate('/');
            } else {
                alert('프로필 수정 실패');
            }
        } catch (error) {
            const message = error.response?.data?.message || '프로필 수정 중 오류가 발생했습니다';
            alert(message);
        }
    }

    const handleCancel = () => {
        navigate(-1); // 이전 페이지로 이동
    }

    // 사용자가 인증이 안된 상태이면
    if (!isAuthenticated) {
        // 로그인 페이지로 이동
        navigate('/login')
        return null;
    }

    // 프로필 로딩중 처리
    if (isLoadingProfile) {
        return (
            <>
                <GNB/>
                <div className="profile-container">
                    <div className="profile-card">
                        <h1>프로필 수정</h1>
                        <div className="profile-loading">
                            <p>사용자 프로필 정보를 불러오는 중...</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // 메인 렌더링
    return (
        <>
            <GNB/>
             <div className="profile-container">
             <div className="profile-card">
                 <h1>프로필 수정</h1>

                 <form action={handleSubmit} className="profile-form">
                   
                    <FormField
                        label="닉네임"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                        placeholder="닉네임을 입력하세요"
                        required
                    />
                    <div className="form-row">
                        <FormField
                            label="성"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            error={errors.lastName}
                            placeholder="성을 입력하세요"
                            half
                        />
                        <FormField
                            label="이름"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            error={errors.firstName}
                            placeholder="이름을 입력하세요"
                            half
                        />
                    </div>

                    <FormField
                        label="전화번호"
                        name="phoneNumber"
                        value={formData.phoneNumbe}
                        onChange={handleChange}
                        error={errors.phoneNumbe}
                        placeholder="전화번호를 입력하세요"
                    />

                    <FormField
                        label="주소 1"
                        name="address1"
                        value={formData.address1}
                        onChange={handleChange}
                        error={errors.address1}
                        placeholder="시/도, 구/군"
                    />

                    <FormField
                        label="주소 2"
                        name="address2"
                        value={formData.address1}
                        onChange={handleChange}
                        error={errors.address1}
                        placeholder="상세 주소"
                    />

                    <div className="button-group">
                        <button
                        type="button"
                        className="cancel-button"
                        onClick={handleCancel}
                        disabled={isLoading}
                        >취소</button>
                        <button
                        type="submit"
                        className="submit-button"
                        disabled={isLoading}
                        >저장</button>
                    </div>
                 </form>
             </div>
         </div>
        </>
    );
}

// FormField Component 정의
function FormField({
    label,
    name,
    type='text',
    value,
    onChange,
    error,
    placeholder,
    required,
    half
}){
    return (
        <div className={`form-group ${half ? 'half':''}`}>
            <label htmlFor={name}>
                {label} {required && '*'}
            </label>
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={error ? 'error':''}
            />
            {error && <span className="error-message">{error}</span>}
        </div>
    );
}

export default Profile;