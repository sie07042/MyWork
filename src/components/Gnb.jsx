import { Link, useNavigate } from 'react-router-dom';
import './Gnb.css'      // styleshsst 불러오기
import { useAuth } from '../hooks/useAuth';

function GNB() {

    const navigate = useNavigate();

    // AuthContext에서 인증 정보 가져오기
    const {user,isAuthenticated,isLoading,logout} = useAuth();

    const handleLogout = async () => {
        if (window.confirm('로그아웃 하시겠습니까?')) {
            try{
                await logout();
                alert('로그아웃되었습니다.');
                navigate('/');
            } catch(error){
                console.log('로그아웃 처리중 에러가 발생함: ', error)
                navigate('/')
            }
        }
    }

    return(
        <>
        <nav className='gnb'>
            <div className='gnb-container'>
                {/* 왼쪽 영역 : 네비게이션 링크 */}
                <div className='gnb-left'>
                    <Link to="/" className={`gnb-link ${location.pathname === '/home' ? 'active':''}`}> 
                        HOME
                    </Link>
                </div>

                {/* 오른쪽 영역 : 로그인 상태에 따라서 로그인/회원가입 또는 유저정보/로그아웃 */}
                <div className='gnb-right'>
                    {/* jsx영역에 javascript code를 작성할때는 {}(중괄호)를 만들어 코드를 작성한다. */}
                    {
                        isLoading ? (
                            <span>로딩중...</span>
                        ) : isAuthenticated ?(
                            <>
                            {/* 사용자 정보 노출과 로그아웃 버튼*/}
                            <span>{user.username}님</span>
                            <button onClick={handleLogout} className=''>로그아웃</button>
                            </>
                        ) : (
                            <>
                                {/**/}
                                <Link to='/login' className='auth-link'>
                                    로그인
                                </Link>
                                <Link to='/signup' className='auth-link signup'>
                                    회원가입
                                </Link>
                             </>
                        )
                    }
                </div>
            </div>
        </nav>
        </>
    );
}

export default GNB;