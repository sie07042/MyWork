import { useRef } from "react";
import "./ProfileImageSection.css";

function ProfileImageSection({previewImage, previewBackground, onImageSelect}) {
    // 숨겨진 파일 input을 참조하기위한 ref
    const profileInputRef = useRef(null);
    const backgroundInputRef = useRef(null);

    // 이미지 파일 오픈 선택 다이얼로그 열기
    const openProfileImage = () => profileInputRef.current?.click();
    const openBackgroundImage = () => backgroundInputRef.current?.click();

    // 공통 파일 변경 핹들러
    const handleFileChange = (e,type) => {
        const file = e.target.files?.[0];
        if (file) {
            onImageSelect (file, type);
        }
    }

    return(
        <>
            {/*배경 프로필 이미지 보여주는 컨테이너*/}
            <div className="profile-header-section">
                {/*배경 이미지 영역*/}
                <div
                    className="profile-background-wrapper"
                    onClick={openBackgroundImage}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e)=> e.key === 'Enter' && openBackgroundImage}
                    style={{
                        backgroundImage: previewBackground ? `url(${previewBackground})` : 'none'
                    }}
                >
                    {!previewBackground && (
                        <div className="background-placeholder">
                            <span className="background-placeholder-text">배경이미지 선택</span>
                        </div>
                    )}
                    <div className="profile-background-overlay">
                        <span>배경 이미지 변경</span>
                    </div>
                </div>
                {/*숨겨진 배경 이미지 파일 입력 컨트롤*/}
                <input 
                    type="file"
                    ref={backgroundInputRef}
                    onChange={(e)=> handleFileChange(e, 'background')}
                    accept="image/*"
                    style={{display: 'none'}}
                />

                {/*프로필 이미지 영역*/}
                <div className="profile-image-container">
                    <div
                        className="profile-image-wrpper"
                        onClick={openProfileImage}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e)=>e.key === 'Enter' && openProfileImage}
                    >
                        {
                            previewImage ? (
                                <img src={previewImage} alt="프로필 이미지" className="profile-image"/>
                            ) :(
                                <div className="profile-image-place-holder">
                                    <span className="placeholder-text">이미지 선택</span>
                                </div>
                            )
                        }

                        <div className="profile-image-overlay">
                            <span>변경</span>
                        </div>
                    </div>
                    <input type="file"
                    ref={profileInputRef}
                    onChange={(e)=>handleFileChange(e, 'profile')}
                    accept="image/*"
                    style={{display:'none'}} 
                    />
                </div>
            </div>
            <p className="image-hint">
                프로필 이미지의 배경 이미지를 클릭하여 변경하세요
            </p>
        </>
    );
}

export default ProfileImageSection;